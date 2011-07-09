/*
 * jquery.tooltiq v0.1
 *
 * Just another tooltip plugin for jQuery
 *
 * Requires:
 *  jQuery v1.4.2+
 *  jQuery Templates plugin (http://github.com/jquery/jquery-tmpl)
 *
 * Copyright 2011, Anton Romanovich
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

(function($) {

    if (typeof $.fn.tooltiq === 'function') { return; }

    var methods = {
        init: function(options) {
            var settings = $.extend({}, $.fn.tooltiq.defaults, options);
            return this.each(function() {
                var $el = $(this);

                var data = {
                    shown: false,
                    settings: settings
                };

                if (settings.disableBrowserTooltips && $el.attr('title')) {
                    data.originalTitle = $el.attr('title');
                    $el.removeAttr('title');
                }

                $el.data('tooltiq', data);
                settings.bindShow.call(this, bind(delayedShow, this), bind(cancelDelayedShow, this));
            });
        },

        show: function() {
            return this.each(function() {
                var $el = $(this),
                    data = $el.data('tooltiq');
                
                if (!data.shown) {
                    var context = {};
                    $.each(this.attributes, function(index, attribute) {
                        context[attribute.nodeName] = attribute.nodeValue;
                    });
                    if (data.originalTitle) {
                        context.title = data.originalTitle;
                    }
                    $.extend(context, data.settings.context);

                    var $tooltip = $('#' + data.settings.templateId).tmpl(context);
                    
                    var parent = $(data.settings.parentSelector).get(0);
                    var parentOffset = $.nodeName(parent, 'body') ? { left: 0, top: 0 } : 
                                                                    $(parent).offset();
                    var offset = $el.offset();
                    $tooltip.fadeIn(data.settings.fadeSpeed)
                            .appendTo($(parent))
                            .css({
                                left: offset.left - parentOffset.left -
                                      ($tooltip.outerWidth() - $el.outerWidth()) / 2 +
                                      data.settings.offset[0],
                                top:  offset.top  - parentOffset.top -
                                      $tooltip.outerHeight() +
                                      data.settings.offset[1]
                            });

                    data.shown = true;
                    data.tooltip = $tooltip;
                    data.settings.bindHide.call(this, $tooltip, bind(methods.hide, $el));
                }
            });
        },

        hide: function() {
            return this.each(function() {
                var $el = $(this),
                    data = $el.data('tooltiq');

                if (data.shown) {
                    var $tooltip = data.tooltip;
                    $tooltip.fadeOut(data.settings.fadeSpeed, function() {
                        $(this).remove();
                        data.shown = false;
                    });
                    data.settings.unbindHide.call(this, $tooltip);
                }
            });
        },

        destroy: function(content) {
            return this.each(function() {
                var $el = $(this),
                    data = $el.data('tooltiq');
                
                $el.tooltiq('hide');
                if (data.originalTitle) {
                    $el.attr('title', data.originalTitle);
                }
                data.settings.unbindShow.call(this);
                $el.removeData('tooltiq');
            });                 
        }
    };

    $.fn.tooltiq = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.tooltiq');
        }    
    };

    function bind(f, scope) {
        return function() {
            return f.apply(scope);
        };
    }

    function delayedShow() {
        var $el = $(this),
            data = $el.data('tooltiq');

        if (data.settings.delay > 0) {
            data.timeoutId = window.setTimeout(function () {
                $el.tooltiq('show');
            }, data.settings.delay);
        } else {
            $el.tooltiq('show');
        }
        return false;
    }

    function cancelDelayedShow() {
        var data = $(this).data('tooltiq');
        if (data.settings.delay > 0) {
            window.clearTimeout(data.timeoutId);
        }
    }

    $.fn.tooltiq.defaults = {
        context: {},
        delay: 250,
        disableBrowserTooltips: true,
        fadeSpeed: 150,
        offset: [0, 0],
        parentSelector: 'body',
        templateId: 'tooltiq-template',
        
        bindShow: function(delayedShow, cancelDelayedShow) {
            var $el = $(this);
            $el.bind('mouseover.tooltiq.show', delayedShow);
            $el.bind('mouseout.tooltiq.show.cancel', cancelDelayedShow);
        },
        bindHide: function($tooltip, hide) {
            $(this).bind('mouseout.tooltiq.hide', hide);
        },
        unbindHide: function($tooltip) {
            $(this).unbind('.tooltiq.hide');
            $tooltip.unbind('.tooltiq.hide');
        },
        unbindShow: function() {
            $(this).unbind('.tooltiq.show');
        }
    };

}(jQuery));
