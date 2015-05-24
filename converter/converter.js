import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import moment from 'moment';

// Get and parse the data
import data from './data/reactjs-news.ghost.2015-05-24.json';
const posts = data.db[0].data.posts;
const users = _.indexBy(data.db[0].data.users, 'id');
const tags = _.indexBy(data.db[0].data.tags, 'id');
const postTags = data.db[0].data.posts_tags;

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
  });
});
