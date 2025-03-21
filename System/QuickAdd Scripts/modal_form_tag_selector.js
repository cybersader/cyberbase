module.exports = async function openTagModal(params) {
    const modalForm = app.plugins.plugins.modalforms.api;
    // Open the modal form named 'tag-picker'
    const result = await modalForm.openForm('tag-picker');
    // Assume the form returns an object with a "tag" property
    return result.getData().tag;
  }
  