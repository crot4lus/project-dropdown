var CompositeDisposable, ProjectDropdown;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$ = jQuery = require('jquery');
CompositeDisposable = require('atom').CompositeDisposable;
module.exports = ProjectDropdown = {
    subscriptions: null,
    activate: function(state) {
        var scope = this;
        // Use window ready to identify when the tree view is loaded
        $(window).ready(function(){
            var $treeViewScroller = $('.tree-view-scroller'),
                $projectContainer = $('<div/>', {
                    'class': 'project-dropdown-container'
                }),
                $selectElement = $('<select/>', {
                    'class': 'project-dropdown-select',
                    'id': 'project-dropdown-select'
                }),
                $label = $('<label/>', {
                    'for': 'project-dropdown-select',
                    'text': 'Current Project:'
                });

            $projectContainer.prependTo($treeViewScroller);
            $label.appendTo($projectContainer);
            $selectElement.appendTo($projectContainer);

            scope.createOptions();

            $selectElement.on('change', function(){
                var $this = $(this),
                    $chosenOption = $selectElement.find(':selected');
                $('.tree-view-scroller .directory.project-root').hide();
                $('.tree-view-scroller .directory.project-root:eq(' + $chosenOption.data('index') + ')').show();
            });

            atom.project.onDidChangePaths(function(e){
                var lastItem = e.pop(),
                    projectName = lastItem.split('/').pop(),
                    $selectElement = $('select.project-dropdown-select');

                $('option', $selectElement).remove();

                scope.createOptions(projectName);
            });
        });
    },
    createOptions: function(selectSpecific) {
        $('.tree-view-scroller .directory.project-root').each(function(){
            var $this = $(this);
            $('<option/>', {
                'text': $('.header .name', $this).data('name'),
                'data-index': $this.index()
            }).appendTo($('select.project-dropdown-select'));
        });

        if(selectSpecific) {
            // Get the element of the new item
            var $newActive = $('span.name[data-name="' + selectSpecific + '"]').parents('li');
            // Hide all project roots
            $('.tree-view-scroller .directory.project-root').hide();
            // Show specific item
            $newActive.show();
            // Override the select to the new specific item
            $('select.project-dropdown-select').val(selectSpecific);
        }else{
            // Hide all project roots, show the first
            $('.tree-view-scroller .directory.project-root').hide().first().show();
        }
    },
    deactivate: function() {
        $('.project-dropdown-container').remove();
        $('.tree-view-scroller .directory.project-root').show();
    }
};
