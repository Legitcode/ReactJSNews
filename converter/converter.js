import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import moment from 'moment';

// Get and parse the data
import data from './data/reactjs-news.ghost.2015-05-24.json';
const posts = data.db[0].data.posts;
const tags = data.db[0].data.tags;
const postTags = data.db[0].data.posts_tags;

// Loop through posts
// and generate new ones
_.each(_.filter(posts, { status: 'published' }), (postData) => {
  const publishDate = moment(postData.published_at);
  const shortDate = publishDate.format('YYYY-MM-DD');
  const longDate = publishDate.format('YYYY-MM-DD HH:mm');

  // Get the tags for the post
  const tagIdsForPost = _.pluck(_.filter(postTags, { post_id: postData.id }), 'tag_id');
  const tagsForPost = _.compact(_.map(tags, (tag) => {
    if (_.contains(tagIdsForPost, tag.id)) {
      return tag.name;
    }
  }));

  const newPost = `---
layout: post
title:  ${postData.title}
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
