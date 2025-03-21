module.exports = async function select_tags(params) {
    const {app, quickAddApi: {suggester}} = params;
    const allTags = Object.keys(app.metadataCache.getTags());
    let tag = await suggester(allTags, allTags);
    if (!tag) return;
    
    tag = tag.substring(1);  // skip the hash symbol
    return tag;
  }