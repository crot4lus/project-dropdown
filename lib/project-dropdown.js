var CompositeDisposable, ProjectDropdown,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    $ = jQuery = require('jquery');

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = ProjectDropdown = {
    subscriptions: null,
    changePathsObject: null,
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

            ProjectDropdown.changePathsObject = atom.project.onDidChangePaths(function(e){
                if(e.length){
                    if(!dropdownActive){
                        scope.createDropdown();
                        dropdownActive = true;
                    }

                    scope.createOptions(e.pop());
                }
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
            }),
            $closeButton = $('<button/>', {
                'class': 'project-dropdown-close'
            });

        // Create the project dropdown
        $projectContainer.prependTo($treeViewScroller);
        $selectElement.appendTo($projectContainer);
        $closeButton.appendTo($projectContainer);

        // Close active project on click
        $closeButton.on('click', ProjectDropdown.closeActiveProject);


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
        var $chosenOption = $('select.project-dropdown-select').find(':selected'),
            path = $chosenOption.data('path').split(String.fromCharCode(92)).join(String.fromCharCode(92,92));

        $('.tree-view-scroller .directory.project-root').hide();
        $(".tree-view-scroller .directory.project-root .header.list-item span.name[data-path='" + path + "']").parents('li').show();
    },
    closeActiveProject: function(){
        // Find the current select value and make sure the project directory is reflected
        var $chosenOption = $('select.project-dropdown-select').find(':selected'),
            path = $chosenOption.data('path');

        // Remove directory from project
        atom.project.removePath(path);

        // Re-register options
        ProjectDropdown.createOptions();
    },
    createOptions: function(selectSpecific) {
        var $elements = [],
            $selectElement = $('select.project-dropdown-select');

        $('option', $selectElement).remove();

        // Create option elements
        $('.tree-view-scroller .directory.project-root').each(function(){
            var $this = $(this);
            var $option = $('<option/>', {
                'text': $('.header .name', $this).data('name'),
                'data-path': $this.find('.header.list-item span.name').data('path')
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
          selectSpecific = selectSpecific.split(String.fromCharCode(92)).join(String.fromCharCode(92,92));
            // Get the element of the new item
            var $newActive = $('span.name[data-path="' + selectSpecific + '"]').parents('li');
            // Hide all project roots
            $('.tree-view-scroller .directory.project-root').hide();
            // Show specific item
            $newActive.show();
            // Override the select to the new specific item
            $('select.project-dropdown-select').val($('select.project-dropdown-select').find('[data-path="' + selectSpecific + '"]').val());
        }else{
            ProjectDropdown.setActiveProject();
        }

        if(!$elements.length){
            $('.project-dropdown-container').hide();
        }else{
            $('.project-dropdown-container').show();
        }
    },
    deactivate: function() {
        $('.project-dropdown-container').remove();
        $('.tree-view-scroller .directory.project-root').show();
        ProjectDropdown.changePathsObject.dispose();
    }
};
