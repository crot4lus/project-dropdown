var CompositeDisposable, ProjectDropdown,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    $ = jQuery = require('jquery');

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = ProjectDropdown = {
    subscriptions: null,
    activate: function(state) {
        var scope = this,
            dropdownActive = false,
            $treeViewScroller = $('.tree-view-scroller');

        // Use window ready to identify when the tree view is loaded
        $(window).ready(function(){
            var existingPaths = atom.project.getPaths();

            if(existingPaths.length){
                scope.createDropdown();
                dropdownActive = true;
            }

            atom.project.onDidChangePaths(function(e){
                if(e.length && !dropdownActive){
                    scope.createDropdown();
                    dropdownActive = true;
                }

                var lastItem = e.pop(),
                    projectName = lastItem.split('/').pop(),
                    $selectElement = $('select.project-dropdown-select');

                $('option', $selectElement).remove();

                scope.createOptions(projectName);
            });
        });
    },
    createDropdown: function(){
        var $treeViewScroller = $('.tree-view-scroller'),
            $projectContainer = $('<div/>', {
                'class': 'project-dropdown-container'
            }),
            $selectElement = $('<select/>', {
                'class': 'project-dropdown-select',
                'id': 'project-dropdown-select'
            });

        // Create the project dropdown
        $projectContainer.prependTo($treeViewScroller);
        $selectElement.appendTo($projectContainer);

        // Create the options
        ProjectDropdown.createOptions();

        // When the select box gets changed, update the project directory
        $selectElement.on('change', function(){
            ProjectDropdown.setActiveProject();
        });

        // Force the select box to follow you as you scroll
        $('.tree-view-scroller').scroll(function(){
            $('div.project-dropdown-container').css('top', $('.tree-view-scroller').scrollTop());
        });
    },
    setActiveProject: function(){
        // Find the current select value and make sure the project directory is reflected
        var $chosenOption = $('select.project-dropdown-select').find(':selected');
        $('.tree-view-scroller .directory.project-root').hide();
        $('.tree-view-scroller .directory.project-root:eq(' + $chosenOption.data('index') + ')').show();
    },
    createOptions: function(selectSpecific) {
        var $elements = [];

        // Create option elements
        $('.tree-view-scroller .directory.project-root').each(function(){
            var $this = $(this);
            var $option = $('<option/>', {
                'text': $('.header .name', $this).data('name'),
                'data-index': $this.index()
            });

            $elements.push($option);
        });

        // Re-organise the elements
        $elements.sort(function(a, b){
            // Convert values to uppercase to ensure fair sorting
            var textA = a[0].text.toUpperCase();
            var textB = b[0].text.toUpperCase();
            if(textA < textB) return -1;
            if(textA > textB) return 1;
            return 0;
        });

        // Loop through the elements and append them to the select box
        $.each($elements, function(index, value){
            value.appendTo($('select.project-dropdown-select'));
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
            ProjectDropdown.setActiveProject();
        }
    },
    deactivate: function() {
        $('.project-dropdown-container').remove();
        $('.tree-view-scroller .directory.project-root').show();
    }
};
