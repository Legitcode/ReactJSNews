import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import moment from 'moment';
import request from 'request';

// Get and parse the data
import data from './data/reactjs-news.ghost.2015-05-24.json';

const OLD_BASE_URL = 'https://reactjsnews.com';
const NEW_BASE_URL = '/reactjsnews';

const posts = data.db[0].data.posts;
const users = _.indexBy(data.db[0].data.users, 'id');
const tags = _.indexBy(data.db[0].data.tags, 'id');
const postTags = data.db[0].data.posts_tags;

const replaceAt = function(string, index, newStr, oldStrLen) {
  return string.substr(0, index) + newStr + string.substr(index + oldStrLen);
};

const images = [];

// Loop through posts
// and generate new ones
_.each(_.filter(posts, { status: 'published' }), (postData) => {
  const publishDate = moment(postData.published_at);
  const shortDate = publishDate.format('YYYY-MM-DD');
  const longDate = publishDate.format('YYYY-MM-DD HH:mm');

  // Get the post author
  const authorName = users[postData.author_id].name;

  // Get the tags for the post
  const tagsForPost = _(postTags)
    .filter({ 'post_id': postData.id })
    .pluck('tag_id')
    .map((tagId) => {
      return tags[tagId].name;
    }).value();

  // Find images
  const imageRegex = /\!\[(.*)\]\((.*)\)/g;
  let match = null;
  while ((match = imageRegex.exec(postData.markdown)) !== null) {
    const url = `${OLD_BASE_URL}${match[2]}`;
    const basename = path.basename(url);

    images.push([url, basename]);

    const newUrl = `${NEW_BASE_URL}/img/${basename}`;

    const newMatch = match[0].replace(/\!\[(.*)\]\((.*)\)/, `![$1](${newUrl})`);
    postData.markdown = replaceAt(postData.markdown, match.index, newMatch, match[0].length);
  }

  const newPost = `---
layout: post
title:  "${postData.title}"
author: ${authorName}
date: ${longDate}
published: true
categories: react${tagsForPost.length ? `\ntags: ${tagsForPost.join(' ')}` : ''}
---
${postData.markdown}`;

  const filename = `${shortDate}-${postData.slug}.md`;

  fs.writeFile(path.join(__dirname, '..', 'posts', filename), newPost, (err) => {
    if (err) {
      throw err;
    }

    console.log(`Wrote ${filename}`);
  });
});

function downloadImage(uri, filename, cb) {
  request.head(uri, function (err, res, body) {
    if (err) {
      throw err;
    }

    const r = request(uri).pipe(fs.createWriteStream(filename));

    if (cb) {
      r.on('close', cb);
    }
  });
}

_.each(images, ([url, basename]) => {
  downloadImage(url, path.join(__dirname, '..', 'img', basename), () => {
    console.log(`Downloaded ${url}.`);
  });
});
