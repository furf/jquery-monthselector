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
      minDate:      new Date(1970, 0, 1),
      maxDate:      new Date(),
      selectedDate: new Date(),
      callback:     null,
      scope:        window,
      monthNames:   ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
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
    return this.each(function() {


      /**
       * DOM Elements
       */
      var $month, $year, $prev, $next;


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
            option.attr('disabled', 'disabled').addClass('disabled');
          } else {
            option.removeAttr('disabled').removeClass('disabled');
          }
        });

        // Disable/enable previous button
        if (__getEndOfPreviousMonth(month, year) < config.minDate) {
          $prev.attr('disabled', 'disabled').addClass('disabled');
        } else {
          $prev.removeAttr('disabled').removeClass('disabled');
        }

        // Disable/enable next button
        if (__getStartOfNextMonth(month, year) > config.maxDate) {
          $next.attr('disabled', 'disabled').addClass('disabled');
        } else {
          $next.removeAttr('disabled').removeClass('disabled');
        }

        // Fire callback
        if (typeof config.callback === 'function') {
          config.callback.call(config.scope, _getSelectedDate());
        }
      };


      /**
       * Create the form elements and assign event handlers
       */

      // Render month select
      $month = $('<select>').change(function() {
        _setDate(_getSelectedDate());
        this.blur();
      });

      // Render month options
      for (var i = 0; i < 12; ++i) {
        $month.append($('<option>').val(i).text(config.monthNames[i]));
      }

      // Render year select
      $year = $('<select>').change(function() {
        _setDate(_getSelectedDate());
        this.blur();
      });

      // Render year options
      var maxYear = config.maxDate.getFullYear();
      var minYear = config.minDate.getFullYear();
      for (var j = maxYear; j >= minYear; --j) {
        $year.append($('<option>').val(j).text(j));
      }

      // Render previous button
      $prev = $('<input type="button">').val('<').click(function() {
        var year  = parseInt($year.val(), 10);
        var month = parseInt($month.val(), 10);
        _setDate(__getEndOfPreviousMonth(month, year));
        this.blur();
      });

      // Render next button
      $next = $('<input type="button">').val('>').click(function() {
        var year  = parseInt($year.val(), 10);
        var month = parseInt($month.val(), 10);
        _setDate(__getStartOfNextMonth(month, year));
        this.blur();
      });

      // Set the form elements to the configured selectedDate
      _setDate(config.selectedDate);

      // Append the form elements to the jQuery instance
      $(this).append($prev).append($month).append($year).append($next);

    });
  };

})(jQuery);
