(function(jsGrid, $, undefined) {
  var Field = jsGrid.Field;

  function ControlField(config) {
    Field.call(this, config);
    this.includeInDataExport = false;
    this._configInitialized = false;
  }

  ControlField.prototype = new Field({
    css: "jsgrid-control-field",
    align: "center",
    width: 30,
    filtering: false,
    inserting: false,
    editing: false,
    sorting: false,

    buttonClass: "jsgrid-button",
    modeButtonClass: "jsgrid-mode-button",

    modeOnButtonClass: "jsgrid-mode-on-button",
    searchModeButtonClass: "jsgrid-search-mode-button",
    insertModeButtonClass: "jsgrid-insert-mode-button",
    editButtonClass: "jsgrid-edit-button",
    deleteButtonClass: "jsgrid-delete-button",
    searchButtonClass: "jsgrid-search-button",
    clearFilterButtonClass: "jsgrid-clear-filter-button",
    insertButtonClass: "jsgrid-insert-button",
    updateButtonClass: "jsgrid-update-button",
    cancelEditButtonClass: "jsgrid-cancel-edit-button",

    searchModeButtonTooltip: "Switch to searching",
    insertModeButtonTooltip: "Switch to inserting",
    editButtonTooltip: "Edit",
    deleteButtonTooltip: "Delete",
    searchButtonTooltip: "Search",
    clearFilterButtonTooltip: "Clear filter",
    insertButtonTooltip: "Insert",
    updateButtonTooltip: "Update",
    cancelEditButtonTooltip: "Cancel edit",

    editButton: true,
    deleteButton: true,
    clearFilterButton: true,
    modeSwitchButton: true,

    _initConfig: function() {
      this._hasFiltering = this._grid.filtering;
      this._hasInserting = false;
      this._grid.inserting = false;
      this._configInitialized = true;
    },

    headerTemplate: function() {
      if (!this._configInitialized) {
        this._initConfig();
      }
      return this._createFilterSwitchButton();
    },

    itemTemplate: function(value, item) {
      var $result = $([]);
      $result = $result.add(
        $("<button style='border:2px solid; border-radius:25px; background-color:#000000; color:#FFFFFF;'>")
          .attr("type", "button")
          .attr("title", "Close Review")
          .text("C")
          .on("click", function() {
            var $grid = $("#openReviewsTable");
            $grid.jsGrid("deleteItem", item);

            var countElement = document.getElementById("openBadge");
            var count = parseFloat(countElement.innerHTML);
            count--;
            countElement.innerHTML = count;

            //document.getElementById("reviewSummaryModal").style.display = "block";
            //document.getElementById("summaryToCloseReviewID").innerHTML = item.ID;
          })
      );
      $result = $result.add(
        $("<button style='border:2px solid; border-radius:25px; background-color:#000000; color:#FFFFFF;'>")
          .attr("type", "button")
          .attr("title", "Remind Reviewers")
          .text("R")
          .on("click", function() {
            //document.getElementById("reviewReminderModal").style.display = "block";
            //document.getElementById("reminderReviewID").innerHTML = item.ID;
          })
      );
      return $result;
    },

    filterTemplate: function() {
      var $result = this._createSearchButton();
      return this.clearFilterButton ? $result.add(this._createClearFilterButton()) : $result;
    },

    _createFilterSwitchButton: function() {
      var isOn = true;
      var updateButtonState = $.proxy(function() {
        $button.toggleClass(this.modeOnButtonClass, isOn);
      }, this);

      var $button = this._createGridButton(this.modeButtonClass + " " + this.searchModeButtonClass, "", function(grid) {
        isOn = !isOn;
        grid.option("filtering", isOn);
        updateButtonState();
      });
      
      updateButtonState();
      return $button;
    },

    _createSearchButton: function() {
      return this._createGridButton(this.searchButtonClass, this.searchButtonTooltip, function(grid) {
        grid.search();
      });
    },

    _createClearFilterButton: function() {
      return this._createGridButton(this.clearFilterButtonClass, this.clearFilterButtonTooltip, function(grid) {
        grid.clearFilter();
      });
    },

    _createGridButton: function(cls, tooltip, clickHandler) {
      var grid = this._grid;
      return $("<input>")
        .addClass(this.buttonClass)
        .addClass(cls)
        .attr({
          type: "button",
          title: tooltip
        })
        .on("click", function(e) {
          clickHandler(grid, e);
        });
    },
    editValue: function() {
      return "";
    }
  });
  jsGrid.fields.openReviewControl = jsGrid.ControlField = ControlField;
})(jsGrid, jQuery);
