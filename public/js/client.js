define('admin/plugins/newsletter',[
	'composer/formatting',
	'composer/preview',
	'composer/uploads',
	'composer/controls',
	'translator'
], function (formatting, preview, uploads, controls, translator) {
	"use strict";

	var Newsletter = { };

	Newsletter.init = function () {
		var $newsletter = $('#newsletter');

		$('#newsletter-send').click(function (e) {
			e.preventDefault();

			$('#newsletter-preview').find(".emoji").attr("style", "width:20px;height:20px;");

			// Append origin to uploaded images/files.
			$newsletter.find('#newsletter-preview').find('img').each(function(){
				var $el = $(this);
				var src = $el.attr('src');
				var origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
				if (src.match(/^\/uploads/)) $el.attr('src', origin + src);
			});

			$newsletter.find('#newsletter-preview').find('a').each(function(){
				var $el = $(this);
				var src = $el.attr('href');
				var origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
				if (src.match(/^\/uploads/)) $el.attr('href', origin + src);
			});

			socket.emit('plugins.Newsletter.send', {
				subject: $('#newsletter-subject').val(),
				template: $('#newsletter-preview').html(),
				group: $('#newsletter-group').val()
			}, function (success) {
				if (success) {
					app.alert({
						type: 'success',
						alert_id: 'newsletter-send',
						title: 'Newsletter Sent'
					});
				}else{
					app.alert({
						type: 'error',
						alert_id: 'newsletter-send',
						title: 'Error'
					});
				}
			});
		});

		function render() {
			if (preview) {
				preview.render($newsletter, function (err, data) {
					if ($('#raw').is(":checked")) {
						var txt = document.createElement("textarea");
						txt.innerHTML = $('#newsletter-preview').html();
						$('#newsletter-preview').html(txt.value);
					}
				});
			}
		}

		$('#newsletter-template').on('input propertychange', render);
		$('#newsletter-template').select(render);
		$('#raw').change(render);

		$('#newsletter-template').on('scroll', function (e) {
			if (preview) {
				preview.matchScroll($newsletter);
			}
		});

		render();

		formatting.addHandler($newsletter);
		formatting.addComposerButtons();

		if (config.hasImageUploadPlugin) {
			$newsletter.find('.img-upload-btn').removeClass('hide');
			$newsletter.find('#files.lt-ie9').removeClass('hide');
		}

		if (config.allowFileUploads) {
			$newsletter.find('.file-upload-btn').removeClass('hide');
			$newsletter.find('#files.lt-ie9').removeClass('hide');
		}

		if (uploads) {
			uploads.initialize("newsletter");
		}

		// TEMP: Mimic a real composer for Markdown.
		if (formatting && controls) {
			translator.getTranslations(window.config.userLang || window.config.defaultLang, 'markdown', function(strings) {
				formatting.addButtonDispatch('bold', function(textarea, selectionStart, selectionEnd){
					if(selectionStart === selectionEnd){
						controls.insertIntoTextarea(textarea, '**' + strings.bold + '**');
						controls.updateTextareaSelection(textarea, selectionStart + 2, selectionStart + strings.bold.length + 2);
					} else {
						controls.wrapSelectionInTextareaWith(textarea, '**');
						controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
					}
				});

				formatting.addButtonDispatch('italic', function(textarea, selectionStart, selectionEnd){
					if(selectionStart === selectionEnd){
						controls.insertIntoTextarea(textarea, '*' + strings.italic + '*');
						controls.updateTextareaSelection(textarea, selectionStart + 1, selectionStart + strings.italic.length + 1);
					} else {
						controls.wrapSelectionInTextareaWith(textarea, '*');
						controls.updateTextareaSelection(textarea, selectionStart + 1, selectionEnd + 1);
					}
				});

				formatting.addButtonDispatch('list', function(textarea, selectionStart, selectionEnd){
					if(selectionStart === selectionEnd){
						controls.insertIntoTextarea(textarea, "\n* " + strings.list_item);

						// Highlight "list item"
						controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + strings.list_item.length + 3);
					} else {
						controls.wrapSelectionInTextareaWith(textarea, '\n* ', '');
						controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
					}
				});

				formatting.addButtonDispatch('strikethrough', function(textarea, selectionStart, selectionEnd){
					console.log(strings);
					if(selectionStart === selectionEnd){
						controls.insertIntoTextarea(textarea, "~~" + strings.strikethrough_text + "~~");
						controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + strings.strikethrough_text.length + 2);
					} else {
						controls.wrapSelectionInTextareaWith(textarea, '~~', '~~');
						controls.updateTextareaSelection(textarea, selectionStart + 2, selectionEnd + 2);
					}
				});

				formatting.addButtonDispatch('link', function(textarea, selectionStart, selectionEnd){
					if(selectionStart === selectionEnd){
						controls.insertIntoTextarea(textarea, "[" + strings.link_text + "](" + strings.link_url + ")");

						// Highlight "link url"
						controls.updateTextareaSelection(textarea, selectionStart + strings.link_text.length + 3, selectionEnd + strings.link_text.length + strings.link_url.length + 3);
					} else {
						controls.wrapSelectionInTextareaWith(textarea, '[', '](' + strings.link_url + ')');

						// Highlight "link url"
						controls.updateTextareaSelection(textarea, selectionEnd + 3, selectionEnd + strings.link_url.length + 3);
					}
				});

				formatting.addButtonDispatch('picture-o', function(textarea, selectionStart, selectionEnd){
					if(selectionStart === selectionEnd){
						controls.insertIntoTextarea(textarea, "![" + strings.picture_text + "](" + strings.picture_url + ")");

						// Highlight "picture url"
						controls.updateTextareaSelection(textarea, selectionStart + strings.picture_text.length + 4, selectionEnd + strings.picture_text.length + strings.picture_url.length + 4);
					} else {
						controls.wrapSelectionInTextareaWith(textarea, '![', '](' + strings.picture_url + ')');

						// Highlight "picture url"
						controls.updateTextareaSelection(textarea, selectionEnd + 4, selectionEnd + strings.picture_url.length + 4);
					}
				});
			})
		}

		$('span[data-format]').tooltip();
	};

	return Newsletter;
});
