// @ts-nocheck

$(document).ready(function () {

  const toolBar = [
    'bold', 'italic', 'heading', {
      name: 'center',
      action: function centerItem(editor) {

        var cm = editor.codemirror;
        var output = '';
        var selectedText = cm.getSelection();
        var text = selectedText || 'placeholder';

        output = '###### ' + text;
        cm.replaceSelection(output);

      },
      className: 'icon-center align-middle',
      title: 'Center Selected',
    }, '|', 'horizontal-rule',
    'code', 'quote', 'unordered-list', 'ordered-list', '|',
    'link', 'image', '|', 'preview', 'side-by-side', 'fullscreen', '|'
  ]

  new SimpleMDE({
    element: document.getElementById("editor"),
    toolbar: toolBar,
    spellChecker: false,
    promptURLs: true,
    forceSync: true,
    autoDownloadFontAwesome: true
  }).togglePreview();

});
