(function($) {

  /**
   * $.fn.monthSelector
   * Creates form elements for selecting a date by month and year and appends
   * them to the jQuery instance.
   *
   * @version 1.0
   * @author David Furfero
   * @param {Object} cfg Configuration variables
   * @returns {Object} Modified jQuery instance
   */
  $.fn.monthSelector = function(cfg) {


    /**
     * Configuration
     * User-defined values (cfg) override default settings below
     */
    var config = $.extend({
      minDate:          new Date(1970, 0, 1),
      maxDate:          new Date(),
      selectedDate:     new Date(),
      callback:         null,
      scope:            window,
      monthFormat:      'long',
      yearFormat:       'long',
      firstText:        '«',
      lastText:         '»',
      prevText:         '<',
      nextText:         '>',
      showFirstAndLast: true,
      showPrevAndNext:  true,
      longMonthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      shortMonthNames: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      numericMonthNames: [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
      ],
      leadingZeroMonthNames: [
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
      ]
    }, cfg || {});


    /**
     * Accept dates or strings as values for minDate, maxDate, and
     * selectedDate configuration properties
     */
    if (!(config.minDate instanceof Date)) {
      config.minDate = new Date(config.minDate);
    }

    if (!(config.maxDate instanceof Date)) {
      config.maxDate = new Date(config.maxDate);
    }

    if (!(config.selectedDate instanceof Date)) {
      config.selectedDate = new Date(config.selectedDate);
    }


    /**
     * Validate configured date values
     */
    if (config.minDate.toString() === 'Invalid Date') {
      throw new TypeError('$().monthSelector: Invalid minDate.');
    }

    if (config.maxDate.toString() === 'Invalid Date') {
      throw new TypeError('$().monthSelector: Invalid maxDate.');
    }

    if (config.selectedDate.toString() === 'Invalid Date') {
      throw new TypeError('$().monthSelector: Invalid selectedDate.');
    }

    if (config.minDate > config.maxDate) {
      throw new Error('$().monthSelector: minDate exceeds maxDate.');
    }


    /**
     * Use configured month names
     */
    var monthNames = config[config.monthFormat + 'MonthNames'];


    /**
     * CSS class names
     */
    var css = {
      fieldset: 'ms-fieldset',
      select:   'ms-select',
      button:   'ms-button',
      month:    'ms-month',
      year:     'ms-year',
      first:    'ms-first',
      last:     'ms-last',
      prev:     'ms-prev',
      next:     'ms-next',
      hovered:  'ms-hovered',
      disabled: 'ms-disabled'
    };


    /**
     * Returns date object representing last day of previous month
     * @param {Number} month Number representing the current month
     * @param {Number} year Number representing the current year
     * @returns {Date} Last day of previous month
     */
    var __getEndOfPreviousMonth = function(month, year) {
      return new Date((new Date(year, month, 1)).getTime() - 1);
    };


    /**
     * Returns date object representing first day of next month
     * @param {Number} month Number representing the current month
     * @param {Number} year Number representing the current year
     * @returns {Date} First day of next month
     */
    var __getStartOfNextMonth = function(month, year) {
      return new Date(year, month + 1, 1);
    };


    /**
     * Modify $() elements
     */
    this.each(function() {


      /**
       * Set unique ID
       */
      var id = $.fn.monthSelector.counter++;

      
      /**
       * DOM elements
       */
      var $fieldset,
          $month,
          $year,
          $first,
          $last,
          $prev,
          $next;


      /**
       * Parses form values and returns a date representing the first day of
       * the selected month
       * @returns {Date} First day of the selected month
       */
      var _getSelectedDate = function() {
        var year  = parseInt($year.val(), 10);
        var month = parseInt($month.val(), 10);
        return new Date(year, month, 1);
      };


      /**
       * Sets the calendar date, updates the form elements, and fires the
       * configured callback, passing the selected date as the argument. If
       * the date is outside of the configured range, _setDate will set it to
       * the nearest limit.
       * @param {Date} Any valid date object
       * @throws {TypeError} Invalid date
       */
      var _setDate = function(date) {

        // Validate date argument
        if (!(date instanceof Date) || date.toString() === 'Invalid Date') {
          throw new TypeError('$().monthSelector::_setDate: Invalid date.');
        }

        // Pull date into range
        if (date > config.maxDate) {
          date = config.maxDate;
        } else if (date < config.minDate) {
          date = config.minDate;
        }

        var month = date.getMonth();
        var year  = date.getFullYear();

        // Set select values
        $month.val(month);
        $year.val(year);

        // Update disabled attributes of inputs and options
        var minMonth = config.minDate.getMonth();
        var minYear  = config.minDate.getFullYear();
        var maxMonth = config.maxDate.getMonth();
        var maxYear  = config.maxDate.getFullYear();

        // Disable/enable month options
        $month.find('option').each(function() {
          var option = $(this);
          var val = option.val();
          if (year === minYear && val < minMonth || year === maxYear && val > maxMonth) {
            option.attr('disabled', 'disabled').addClass(css.disabled);
          } else {
            option.removeAttr('disabled').removeClass(css.disabled);
          }
        });

        // Disable/enable previous button
        if (__getEndOfPreviousMonth(month, year) < config.minDate) {
          $prev.attr('disabled', 'disabled').addClass(css.disabled);
          $first.attr('disabled', 'disabled').addClass(css.disabled);
        } else {
          $prev.removeAttr('disabled').removeClass(css.disabled);
          $first.removeAttr('disabled').removeClass(css.disabled);
        }

        // Disable/enable next button
        if (__getStartOfNextMonth(month, year) > config.maxDate) {
          $next.attr('disabled', 'disabled').addClass(css.disabled);
          $last.attr('disabled', 'disabled').addClass(css.disabled);
        } else {
          $next.removeAttr('disabled').removeClass(css.disabled);
          $last.removeAttr('disabled').removeClass(css.disabled);
        }

        // Fire callback
        if (typeof config.callback === 'function') {
          config.callback.call(config.scope, _getSelectedDate());
        }
      };


      /**
       * Create the form elements and assign event handlers
       */
      
      // Render container
      $fieldset = $('<fieldset>')
        .addClass(css.fieldset)
        .attr('id', css.fieldset + '-' + id);
      
      // Render month select
      $month = $('<select>')
        .addClass(css.select + ' ' + css.month)
        .attr('id', css.month + '-' + id)
        .change(function() {
          _setDate(_getSelectedDate());
          this.blur();
        });

      // Render month options
      for (var i = 0; i < 12; ++i) {
        $month.append($('<option>').val(i).text(monthNames[i]));
      }

      // Render year select
      $year = $('<select>')
        .addClass(css.select + ' ' + css.year)
        .attr('id', css.year + '-' + id)
        .change(function() {
          _setDate(_getSelectedDate());
          this.blur();
        });

      // Render year options
      var maxYear = config.maxDate.getFullYear();
      var minYear = config.minDate.getFullYear();
      for (var j = maxYear; j >= minYear; --j) {
        var year;
        if (config.yearFormat === 'short') {
          year = j.toString().substring(2);
        } else {
          year = j;
        }
        $year.append($('<option>').val(j).text(year));
      }

      // Render first button
      $first = $('<button>')
        .addClass(css.button + ' ' + css.first)
        .attr('id', css.first + '-' + id)
        .html(config.firstText)
        .click(function() {
          _setDate(config.minDate);
          this.blur();
        });

      // Render last button
      $last = $('<button>')
        .addClass(css.button + ' ' + css.last)
        .attr('id', css.last + '-' + id)
        .html(config.lastText)
        .click(function() {
          _setDate(config.maxDate);
          this.blur();
        });

      // Hide first and last buttons (if configured)
      if (!config.showFirstAndLast) {
        $first.hide();
        $last.hide();
      }

      // Render previous button
      $prev = $('<button>')
        .addClass(css.button + ' ' + css.prev)
        .attr('id', css.prev + '-' + id)
        .html(config.prevText)
        .click(function() {
          var year  = parseInt($year.val(), 10);
          var month = parseInt($month.val(), 10);
          _setDate(__getEndOfPreviousMonth(month, year));
          this.blur();
        });

      // Render next button
      $next = $('<button>')
        .addClass(css.button + ' ' + css.next)
        .attr('id', css.next + '-' + id)
        .html(config.nextText)
        .click(function() {
          var year  = parseInt($year.val(), 10);
          var month = parseInt($month.val(), 10);
          _setDate(__getStartOfNextMonth(month, year));
          this.blur();
        });

      // Hide previous and next buttons (if configured)
      if (!config.showPrevAndNext) {
        $prev.hide();
        $next.hide();
      }

      // Add hover class to each element
      $.each([$fieldset, $month, $year, $first, $last, $prev, $next], function() {
        var $this = this;
        $this.hover(function() {
          $this.addClass(css.hovered);
        }, function() {
          $this.removeClass(css.hovered);
        });
      });

      // Assemble elements
      $fieldset
        .append($first)
        .append($prev)
        .append($month)
        .append($year)
        .append($next)
        .append($last);


      // Set the form elements to the configured selectedDate
      _setDate(config.selectedDate);

      // Append the form elements to the jQuery instance
      $(this).append($fieldset);

    });
    
    return this;
  };

  $.fn.monthSelector.counter = 0;

})(jQuery);