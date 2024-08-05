var Calculator = (function () {
  this.libraries = {
    jQuery: '//code.jquery.com/jquery-2.1.3.min.js',
    jsApi: '//www.google.com/jsapi',
    css: 'calculators.css'
  }
  // css: 'https://home.ca/static/css/calculators.css'

  this.draws = { mortgage: false, affordability: false }
  this.chart = false
  this.mortgage = {
    type: 'payment',
    amount: 250000,
    amortization: 25,
    payment: 1000,
    frequency: 'monthly',
    product: 'custom',
    interest: 5,
    logo: '',
    chart: true,
    layout: '',
    minAmount: 1000,
    minAmortization: 1,
    maxAmortization: 35,
    minPayment: 100,
    minInterest: 0.5,
    title: 'Mortgage Payment Calculator',
    colorBackground: '',
    colorText: '',
    colorInfo: '',
    colorTotal: '',
    fontFamily: '',
    fontSize: '',
    width: 0,
    footer_link: ''
  }
  this.affordability = {
    income: 5000,
    propertyTaxes: 0,
    condoFees: 0,
    heatingCost: 0,
    loans: 0,
    downPayment: 10000,
    product: 'custom',
    interest: 5,
    amortization: 25,
    logo: '',
    chart: true,
    layout: '',
    minIncome: 1000,
    minInterest: 0.5,
    minDownPayment: 5,
    insuranceThreshold: 20,
    insurancePremiums: {
      0: 0,
      65: 0.5,
      75: 0.65,
      80: 1,
      85: 1.75,
      90: 2,
      95: 2.75
    },
    insuranceSurcharge: { 0: 0, 25: 0.2 },
    maxAmortization: 30,
    maxGDSR: 32,
    maxTDSR: 40,
    title: 'Mortgage Affordability Payment Calculator',
    colorBackground: '',
    colorText: '',
    colorInfo: '',
    colorTotal: '',
    fontFamily: '',
    fontSize: '',
    width: 0,
    footer_link: ''
  }
  this.ownership = {
    price: 200000,
    downPayment: 20000,
    amortization: 25,
    product: 'custom',
    interest: 5,
    priceIncrease: 1,
    rent: 1200,
    rentIncrease: 1,
    timeframe: 5,
    logo: '',
    chart: true,
    layout: '',
    minPrice: 10000,
    maxPrice: 10000000,
    minDownPayment: 5,
    minInterest: 0.5,
    maxAmortization: 30,
    maxTimeframe: 10,
    title: 'Rent vs. Own Calculator',
    colorBackground: '',
    colorText: '',
    colorInfo: '',
    fontFamily: '',
    fontSize: '',
    width: 0,
    footer_link: ''
  }
  this.setOptions = function (b, a) {
    for (var c in a) {
      this[b][c] = a[c]
    }
    this.draws[b] = true
    if (this[b].chart) {
      this.chart = true
    }
    return this
  }
  this.init = function () {
    var a = false
    for (var b in this.draws) {
      if (this.draws[b]) {
        a = true
        break
      }
    }
    if (!a) {
      return
    }
    if (!window.jQuery) {
      this.loadjQuery()
    } else {
      this.loadJsApi()
      this.loadCSS()
      this.draw()
    }
  }
  this.loadjQuery = function () {
    var a = document.createElement('script')
    a.src = this.libraries.jQuery
    a.onload = function () {
      jQuery.noConflict()
      Calculator.loadJsApi()
      Calculator.loadCSS()
      Calculator.draw()
    }
    a.onerror = function () {
      throw new Error('Failed loading jQuery')
    }
    document.body.appendChild(a)
  }
  this.loadCSS = function () {
    jQuery('<link/>', {
      rel: 'stylesheet',
      type: 'text/css',
      href: this.libraries.css
    }).appendTo('head')
  }
  this.loadJsApi = function () {
    if (!this.chart) {
      return
    }
    jQuery.ajax({
      url: this.libraries.jsApi,
      dataType: 'script',
      cache: true,
      success: function () {
        google.load('visualization', '1', {
          packages: ['corechart'],
          callback: Calculator.update
        })
      }
    })
  }
  this.draw = function () {
    if (this.draws.mortgage) {
      this.drawMortgage()
    }
    if (this.draws.affordability) {
      this.drawAffordability()
    }
    if (this.draws.ownership) {
      this.drawOwnership()
    }
    if (!this.chart) {
      this.update()
    }
  }
  this.update = function () {
    if (this.draws.mortgage) {
      this.updateMortgage()
    }
    if (this.draws.affordability) {
      this.updateAffordability()
    }
    if (this.draws.ownership) {
      this.updateOwnership()
    }
  }
  this.error = function (a) {
    jQuery('#calculator-mortgage-type').html(a)
    jQuery('#calculator-mortgage-result').html('')
    return false
  }
  this.period = function (a) {
    if (a % 12 > 11) {
      return Math.ceil(a / 12) + ' years'
    } else {
      if (a % 12 > 0) {
        return Math.floor(a / 12) + 'y ' + Math.ceil(a % 12) + 'm'
      } else {
        return Math.floor(payments / 12) + ' years'
      }
    }
  }
  this.round2 = function (b, a) {
    if (!a) {
      a = 2
    }
    return parseFloat(
      (Math.round(b * Math.pow(10, a)) / Math.pow(10, a)).toFixed(a)
    )
  }
  this.format = function (b, a) {
    var c = parseFloat(b || 0)
    a = a || 0
    c = a ? this.round2(b).toFixed(2) : Math.round(c)
    return ('' + c).replace(/\d(?=(\d{3})+(\.|$))/g, '$&,')
  }
  this.validNumber = function (d, c, a) {
    var b = d.replace(/[^0-9.]/g, '')
    if (c != undefined && b < c) {
      b = c
    }
    if (a != undefined && b > a) {
      b = a
    }
    return parseFloat(b)
  }
  this.tooltip = function (a) {
    if (!this.$tooltip) {
      this.$tooltip = jQuery('<div />')
        .attr('id', 'calculator-tooltip')
        .appendTo('body')
    }
    if (a) {
      var b = jQuery(a).position()
      this.$tooltip
        .html(jQuery(a).attr('alt'))
        .stop(true, true)
        .fadeIn()
        .css({ left: b.left + 20, top: b.top - this.$tooltip.outerHeight() })
    } else {
      this.$tooltip.fadeOut()
    }
  }
  this.getSchedule = function (f, a, h) {
    var g = new Array()
    var e = 0
    var d = 0
    do {
      var c = this.round2(f * h)
      var b = this.round2(a - c)
      f = this.round2(f - b)
      e = this.round2(e + b)
      d = this.round2(d + c)
      g.push({
        principal: f,
        principal_paid: e,
        payment: b,
        interest: c,
        interest_paid: d
      })
    } while (f > b)
    if (b > 0) {
      var c = this.round2(f * h)
      g.push({
        principal: 0,
        principal_paid: g[g.length - 1].principal_paid + this.round2(f + c),
        payment: this.round2(f + c),
        interest: c,
        interest_paid: g.length > 0 ? g[g.length - 1].interest_paid + c : c
      })
    }
    return g
  }
  this.drawMortgage = function () {
    this.mortgage.$container = jQuery('#' + this.mortgage.container)
    if (!this.mortgage.$container.length) {
      throw new Error('No container defined to hold the mortgage calculator')
    }
    if (!this.mortgage.footer_link && this.mortgage.$container.html() != '') {
      this.mortgage.footer_link = this.mortgage.$container.html()
      this.mortgage.$container.empty()
    }
    this.mortgage.$container
      .addClass('calculator-mortgage')
      .append('<div class="calculator-title">' + this.mortgage.title + '</div>')
    if (this.mortgage.logo) {
      jQuery('.calculator-title', this.mortgage.$container)
        .addClass('calculator-logo')
        .append('<img src="' + this.mortgage.logo + '">')
        .append('<br style="clear:both">')
    }
    this.mortgage.$form = jQuery(
      '<form> \
      <div class="calculator-row"><i alt="What type of simulation you want to run">i</i><label><b>Calculate what?</b><select style="color: rgb(4, 4, 4);" name="type"><option value="payment">Payment</option><option value="amount">Mortgage Amount</option><option value="amortization">Amortization</option></select></label></div> \
      <div class="calculator-row calculator-amount"><i alt="The amount of money you will be borrowing to purchase your home">i</i><label><b>Mortgage Amount</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="amount" size="10" /></label></div> \
      <div class="calculator-row calculator-amortization"><i alt="The actual number of years it will take for you to repay your mortgage in full">i</i><label><b>Amortization</b>years <input style="color: rgb(4, 4, 4);" type="text" name="amortization" size="6" /></label></div> \
      <div class="calculator-row calculator-payment"><i alt="The actual amount you will be paying on a regular basis to reduce your mortgage">i</i><label><b>Payment</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="payment" size="8" /></label></div> \
      <div class="calculator-row"><i alt="How often you will be making your payments to your mortgage">i</i><label><b>Payment Frequency</b><select style="color: rgb(4, 4, 4);" name="frequency"><option value="monthly">Monthly</option><option value="semimonthly">Semi-Monthly</option><option value="biweekly">Bi-Weekly</option><option value="weekly">Weekly</option></select></label></div> \
      <div class="calculator-row"><i alt="The desired term for the mortgage">i</i><label><b>Product</b><select style="color: rgb(4, 4, 4);" name="product"><option value="custom">Custom Rate</option></select></label></div> \
      <div class="calculator-row"><i alt="That percent of interest that you will be paying on the mortgage for a specific term">i</i><label><b>Interest rate</b>% <input style="color: rgb(4, 4, 4);" type="text" name="interest" size="6" /></label></div> \
      <div class="calculator-row"><label><b id="calculator-mortgage-type">Monthly Payment</b><div id="calculator-mortgage-result"></div></label></div> \
      </form>'
    )
    this.mortgage.$container.append(this.mortgage.$form)
    if (this.mortgage.chart) {
      this.mortgage.$chart = jQuery(
        '<div class="calculator-chart">Loading chart...</div>'
      )
      this.mortgage.$container.append(this.mortgage.$chart)
    } else {
      this.mortgage.$form.css('width', '100%')
    }
   
    jQuery('input, select', this.mortgage.$form).val(function () {
      if (Calculator.mortgage[this.name]) {
        return Calculator.mortgage[this.name]
      } else {
        throw new Error('Unknown field ' + this.name)
      }
    })
    jQuery('input, select', this.mortgage.$form).change(function () {
      Calculator.updateMortgage()
    })
    jQuery('.calculator-' + this.mortgage.type, this.mortgage.$form).hide()
    jQuery('[name=type]', this.mortgage.$form).change(function () {
      jQuery('.calculator-row:hidden').slideDown()
      jQuery('.calculator-' + jQuery(this).val()).slideUp()
    })
    jQuery('i', this.mortgage.$form).hover(
      function () {
        Calculator.tooltip(this)
      },
      function () {
        Calculator.tooltip(false)
      }
    )
    this.cssMortgage()
    if (this.mortgage.chart) {
      jQuery(window)
        .resize(function () {
          if (Calculator.mortgage.$container.width() < 570) {
            Calculator.mortgage.$container.addClass('calculator-mobile')
          } else {
            Calculator.mortgage.$container.removeClass('calculator-mobile')
          }
          if (
            Calculator.chart &&
            window.google &&
            window.google.visualization
          ) {
            Calculator.update()
          }
        })
        .trigger('resize')
    }
  }
  this.cssMortgage = function () {
    if (this.mortgage.colorBackground) {
      this.mortgage.$container.css(
        'background-color',
        this.mortgage.colorBackground
      )
    }
    if (this.mortgage.colorText) {
      this.mortgage.$container.css('color', this.mortgage.colorText)
    }
    if (this.mortgage.fontFamily) {
      this.mortgage.$container.css('font-family', this.mortgage.fontFamily)
    }
    if (this.mortgage.fontSize) {
      this.mortgage.$container.css('font-size', this.mortgage.fontSize + 'px')
    }
    if (this.mortgage.colorInfo) {
      jQuery('i', this.mortgage.$container).css(
        'background-color',
        this.mortgage.colorInfo
      )
    }
    if (this.mortgage.colorTotal) {
      jQuery('#calculator-mortgage-result').css(
        'color',
        this.mortgage.colorTotal
      )
    }
    if (this.mortgage.width) {
      this.mortgage.$container.width(this.mortgage.width)
    }
    if (this.mortgage.layout == 'vertical') {
      this.mortgage.$container.addClass('calculator-vertical')
    }
    if (this.mortgage.layout == 'formless') {
      this.mortgage.$form.hide()
    }
  }
  this.updateMortgage = function () {
    this.mortgage.type = jQuery('[name=type]', this.mortgage.$form).val()
    this.mortgage.amount = Math.max(
      this.mortgage.minAmount,
      jQuery('[name=amount]', this.mortgage.$form)
        .val()
        .replace(/[^0-9.]/g, '')
    )
    this.mortgage.amortization = Math.max(
      this.mortgage.minAmortization,
      jQuery('[name=amortization]', this.mortgage.$form)
        .val()
        .replace(/[^0-9.]/g, '')
    )
    this.mortgage.payment = Math.max(
      this.mortgage.minPayment,
      jQuery('[name=payment]', this.mortgage.$form)
        .val()
        .replace(/[^0-9.]/g, '')
    )
    this.mortgage.frequency = jQuery(
      '[name=frequency]',
      this.mortgage.$form
    ).val()
    this.mortgage.product = jQuery('[name=product]', this.mortgage.$form).val()
    this.mortgage.interest = Math.max(
      this.mortgage.minInterest,
      jQuery('[name=interest]', this.mortgage.$form)
        .val()
        .replace(/[^0-9.]/g, '')
    )
    var k = Math.pow(1 + this.mortgage.interest / 100 / 2, 1 / 6) - 1
    if (this.mortgage.type == 'payment') {
      if (this.mortgage.amortization > this.mortgage.maxAmortization) {
        return this.error(
          'Maximum allowed amortization is ' +
            this.mortgage.maxAmortization +
            ' years'
        )
      }
      var a = this.mortgage.amortization * 12
      this.mortgage.payment =
        (this.mortgage.amount * (k * Math.pow(k + 1, a))) /
        (Math.pow(k + 1, a) - 1)
      if (this.mortgage.frequency == 'monthly') {
        jQuery('#calculator-mortgage-type').html('Monthly Payment')
      } else {
        if (this.mortgage.frequency == 'semimonthly') {
          this.mortgage.payment = this.mortgage.payment / 2
          jQuery('#calculator-mortgage-type').html('Semi-Monthly Payment')
        } else {
          if (this.mortgage.frequency == 'biweekly') {
            this.mortgage.payment = (this.mortgage.payment * 12) / 26
            jQuery('#calculator-mortgage-type').html('Bi-Weekly Payment')
          } else {
            if (this.mortgage.frequency == 'weekly') {
              this.mortgage.payment = (this.mortgage.payment * 12) / 52
              jQuery('#calculator-mortgage-type').html('Weekly Payment')
            }
          }
        }
      }
      jQuery('#calculator-mortgage-result').html(
        '$' + this.format(this.mortgage.payment, true)
      )
    } else {
      if (this.mortgage.type == 'amount') {
        if (this.mortgage.amortization > this.mortgage.maxAmortization) {
          return this.error(
            'Maximum allowes years is ' + this.mortgage.maxAmortization
          )
        }
        var a = this.mortgage.amortization * 12
        if (this.mortgage.frequency == 'monthly') {
          var c = this.mortgage.payment
        } else {
          if (this.mortgage.frequency == 'semimonthly') {
            var c = this.mortgage.payment * 2
          } else {
            if (this.mortgage.frequency == 'biweekly') {
              var c = (this.mortgage.payment * 26) / 12
            } else {
              if (this.mortgage.frequency == 'weekly') {
                var c = (this.mortgage.payment * 52) / 12
              }
            }
          }
        }
        this.mortgage.amount =
          (c / (k * Math.pow(k + 1, a))) * (Math.pow(k + 1, a) - 1)
        jQuery('#calculator-mortgage-type').html('Mortgage Amount')
        jQuery('#calculator-mortgage-result').html(
          '$' + this.format(this.mortgage.amount)
        )
      }
    }
    if (this.mortgage.chart || this.mortgage.type == 'amortization') {
      if (this.mortgage.frequency == 'semimonthly') {
        k = k / 2
      } else {
        if (this.mortgage.frequency == 'biweekly') {
          k = (k * 12) / 26
        } else {
          if (this.mortgage.frequency == 'weekly') {
            k = (k * 12) / 52
          }
        }
      }
      if (this.round2(this.mortgage.amount * k) > this.mortgage.payment) {
        return this.error('The interest value exceeds the payment value')
      }
      var h = this.getSchedule(this.mortgage.amount, this.mortgage.payment, k)
    }
    if (this.mortgage.type == 'amortization') {
      var e = h.length
      if (this.mortgage.frequency == 'monthly') {
        this.mortgage.amortization = this.round2(e / 12, 1)
        var b = this.period(e)
      } else {
        if (this.mortgage.frequency == 'semimonthly') {
          this.mortgage.amortization = this.round2(e / 24, 1)
          var b = this.period(e / 2)
        } else {
          if (this.mortgage.frequency == 'biweekly') {
            this.mortgage.amortization = this.round2(e / 26, 1)
            var b = this.period(((e * 2) / 52) * 12)
          } else {
            if (this.mortgage.frequency == 'weekly') {
              this.mortgage.amortization = this.round2(e / 52, 1)
              var b = this.period((e / 52) * 12)
            }
          }
        }
      }
      jQuery('#calculator-mortgage-type').html('Amortization period')
      jQuery('#calculator-mortgage-result').html(b)
    }
    jQuery('[name=amount]', this.mortgage.$form).val(
      this.format(this.mortgage.amount)
    )
    jQuery('[name=amortization]', this.mortgage.$form).val(
      this.mortgage.amortization
    )
    jQuery('[name=payment]', this.mortgage.$form).val(
      this.format(this.mortgage.payment, true)
    )
    jQuery('[name=interest]', this.mortgage.$form).val(
      this.round2(this.mortgage.interest)
    )
    if (this.mortgage.chart) {
      if (this.mortgage.frequency == 'monthly') {
        var d = 12
      } else {
        if (this.mortgage.frequency == 'semimonthly') {
          var d = 24
        } else {
          if (this.mortgage.frequency == 'biweekly') {
            var d = 26
          } else {
            if (this.mortgage.frequency == 'weekly') {
              var d = 52
            }
          }
        }
      }
      var g = new google.visualization.DataTable()
      g.addColumn('string', 'Years')
      g.addColumn('number', 'Balance')
      g.addColumn({ type: 'string', role: 'tooltip' })
      g.addColumn('number', 'Total Paid')
      g.addColumn({ type: 'string', role: 'tooltip' })
      g.addColumn('number', 'Principal Paid')
      g.addColumn({ type: 'string', role: 'tooltip' })
      g.addColumn('number', 'Interest Paid')
      g.addColumn({ type: 'string', role: 'tooltip' })
      for (var f = d - 1; f < h.length && h[f].principal > 0; f += d) {
        g.addRow([
          'Year ' + (f + 1) / d,
          h[f].principal,
          '$' + this.format(h[f].principal, true),
          this.round2(h[f].principal_paid + h[f].interest_paid),
          '$' + this.format(h[f].principal_paid + h[f].interest_paid, true),
          h[f].principal_paid,
          '$' + this.format(h[f].principal_paid, true),
          h[f].interest_paid,
          '$' + this.format(h[f].interest_paid, true)
        ])
      }
      f = h.length - 1
      g.addRow([
        this.period(((f + 1) / d) * 12),
        h[f].principal,
        '$' + this.format(h[f].principal, true),
        this.round2(h[f].principal_paid + h[f].interest_paid),
        '$' + this.format(h[f].principal_paid + h[f].interest_paid, true),
        h[f].principal_paid,
        '$' + this.format(h[f].principal_paid, true),
        h[f].interest_paid,
        '$' + this.format(h[f].interest_paid, true)
      ])
      var j = new google.visualization.LineChart(this.mortgage.$chart[0])
      j.draw(g, {
        height: this.mortgage.$form.height(),
        width: '100%',
        title: 'Payment Chart',
        backgroundColor: 'transparent',
        vAxis: { format: '$#,###.##' },
        chartArea: { left: 80, top: 30, width: '100%' },
        legend: 'bottom',
        focusTarget: 'category'
      })
    }
  }
  this.drawAffordability = function () {
    this.affordability.$container = jQuery('#' + this.affordability.container)
    if (!this.affordability.$container.length) {
      throw new Error(
        'No contaier defined to hold the affordability calculator'
      )
    }
    if (
      !this.affordability.footer_link &&
      this.affordability.$container.html() != ''
    ) {
      this.affordability.footer_link = this.affordability.$container.html()
      this.affordability.$container.empty()
    }
    this.affordability.$container
      .addClass('calculator-affordability')
      .append(
        '<div class="calculator-title">' + this.affordability.title + '</div>'
      )
    if (this.affordability.logo) {
      jQuery('.calculator-title', this.affordability.$container)
        .addClass('calculator-logo')
        .append('<img src="' + this.affordability.logo + '">')
        .append('<br style="clear:both">')
    }
    this.affordability.$form = jQuery(
      '<form> \
      <div class="calculator-row"><i alt="The combined amount of income the borrowers earn before taxes or other deductions. This may also include spousal or child support payments received">i</i><label><b>Gross Income</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="income" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The property tax on the home you want to buy broken down on a monthly basis">i</i><label><b>Property Taxes</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="propertyTaxes" size="8" /></label></div> \
      <div class="calculator-row"><i alt="Input the monthly condominium fee for the home you want to buy. Only half of it will be taken into consideration">i</i><label><b>Condominium Fees</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="condoFees" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The estimated monthly heating cost for the home you want to buy">i</i><label><b>Heating Costs</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="heatingCost" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The combined monthly payment obligations the borrowers owe or could be responsible for on all loans and credit card balances">i</i><label><b>Borrowing Payments</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="loans" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The amount of money you have saved for a down payment to buy a home">i</i><label><b>Down Payment</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="downPayment" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The desired product">i</i><label><b>Product</b><select style="color: rgb(4, 4, 4);" name="product"><option value="custom">Custom Rate</option></select></label></div> \
      <div class="calculator-row"><i alt="The percent of interest that you will be paying on the mortgage for a specific term">i</i><label><b>Interest Rate</b>% <input style="color: rgb(4, 4, 4);" type="text" name="interest" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The actual number of years it will take for you to repay your mortgage in full">i</i><label><b>Amortization</b>years <input style="color: rgb(4, 4, 4);" type="text" name="amortization" size="8" /></label></div> \
      </form>'
    )
    this.affordability.$container.append(this.affordability.$form)
    this.affordability.$result = jQuery(
      '<div class="calculator-chart"><strong>You can afford</strong><div class="calculator-row"><label><b>A maximum purchase price of:</b><strong class="affordability-amount">$0</strong></label></div><div class="calculator-row"><label><b>A monthly payment of:</b><strong class="affordability-payment">$0</strong></label></div><div class="calculator-row"><label><b>Max affordable mortgage amount:</b><strong class="affordability-principal">$0</strong></label></div></div>'
    )
    this.affordability.$container.append(this.affordability.$result)
    if (this.affordability.chart) {
      this.affordability.$chart = jQuery(
        '<div id="affordability-chart">Loading chart...</div>'
      )
      this.affordability.$result.append(this.affordability.$chart)
    }
    this.affordability.$container.append(
      '<div class="calculator-footer"><div class="calculator-link">' +
        this.affordability.footer_link +
        '</div>Powered by <a href="http://www.home.ca/" onclick="return !window.open(this.href)">home.ca</a></div>'
    )
    jQuery('input, select', this.affordability.$form).val(function () {
      if (Calculator.affordability[this.name] != undefined) {
        return Calculator.affordability[this.name]
      } else {
        throw new Error('Unknown field ' + this.name)
      }
    })
    jQuery('input, select', this.affordability.$form).change(function () {
      Calculator.updateAffordability()
    })
    jQuery('i', this.affordability.$form).hover(
      function () {
        Calculator.tooltip(this)
      },
      function () {
        Calculator.tooltip(false)
      }
    )
    this.cssAffordability()
    if (this.affordability.chart) {
      jQuery(window)
        .resize(function () {
          if (Calculator.affordability.$container.width() < 600) {
            Calculator.affordability.$container.addClass('calculator-mobile')
          } else {
            Calculator.affordability.$container.removeClass('calculator-mobile')
          }
          if (Calculator.chart && window.google) {
            Calculator.update()
          }
        })
        .trigger('resize')
    }
  }
  this.cssAffordability = function () {
    if (this.affordability.colorBackground) {
      this.affordability.$container.css(
        'background-color',
        this.affordability.colorBackground
      )
    }
    if (this.affordability.colorText) {
      this.affordability.$container.css('color', this.affordability.colorText)
    }
    if (this.affordability.fontFamily) {
      this.affordability.$container.css(
        'font-family',
        this.affordability.fontFamily
      )
    }
    if (this.affordability.fontSize) {
      this.affordability.$container.css(
        'font-size',
        this.affordability.fontSize + 'px'
      )
    }
    if (this.affordability.colorInfo) {
      jQuery('i', this.affordability.$container).css(
        'background-color',
        this.affordability.colorInfo
      )
    }
    if (this.affordability.colorTotal) {
      jQuery(
        '.calculator-chart label strong',
        this.affordability.$container
      ).css('color', this.affordability.colorTotal)
    }
    if (this.affordability.width) {
      this.affordability.$container.width(this.affordability.width)
    }
    if (this.affordability.layout == 'vertical') {
      this.affordability.$container.addClass('calculator-vertical')
    }
    if (this.affordability.layout == 'formless') {
      this.affordability.$form.hide()
    }
  }
  this.updateAffordability = function () {
    this.affordability.income = this.validNumber(
      jQuery('[name=income]', this.affordability.$form).val(),
      this.affordability.minIncome
    )
    this.affordability.propertyTaxes = this.validNumber(
      jQuery('[name=propertyTaxes]', this.affordability.$form).val(),
      0
    )
    this.affordability.condoFees = this.validNumber(
      jQuery('[name=condoFees]', this.affordability.$form).val(),
      0
    )
    this.affordability.heatingCost = this.validNumber(
      jQuery('[name=heatingCost]', this.affordability.$form).val(),
      0
    )
    this.affordability.loans = this.validNumber(
      jQuery('[name=loans]', this.affordability.$form).val(),
      0
    )
    this.affordability.downPayment = this.validNumber(
      jQuery('[name=downPayment]', this.affordability.$form).val(),
      0
    )
    this.affordability.interest = this.validNumber(
      jQuery('[name=interest]', this.affordability.$form).val(),
      this.affordability.minInterest
    )
    this.affordability.amortization = this.validNumber(
      jQuery('[name=amortization]', this.affordability.$form).val(),
      1,
      this.affordability.maxAmortization
    )
    this.affordability.product = jQuery(
      '[name=product]',
      this.affordability.$form
    ).val()
    var b =
      Math.min(
        (this.affordability.maxGDSR * this.affordability.income) / 100,
        (this.affordability.maxTDSR * this.affordability.income) / 100 -
          this.affordability.loans
      ) -
      this.affordability.propertyTaxes -
      this.affordability.heatingCost -
      this.affordability.condoFees / 2
    var l = Math.pow(1 + this.affordability.interest / 100 / 2, 1 / 6) - 1
    var j = this.round2(
      (b / (l * Math.pow(l + 1, 12 * this.affordability.amortization))) *
        (Math.pow(l + 1, 12 * this.affordability.amortization) - 1)
    )
    var c =
      (this.affordability.downPayment / (j + this.affordability.downPayment)) *
      100
    var k = 0
    if (c < this.affordability.insuranceThreshold) {
      for (var f in this.affordability.insurancePremiums) {
        if (c >= 100 - f) {
          break
        }
      }
      k = this.affordability.insurancePremiums[f]
      if (k > 0) {
        var a = 0
        for (var f in this.affordability.insuranceSurcharge) {
          if (this.affordability.amortization > f) {
            a = this.affordability.insuranceSurcharge[f]
          }
        }
        k += a
      }
      var e = this.round2((j * 100) / (100 + k))
    } else {
      var e = j
    }
    var m = this.round2(j - e)
    if (
      (this.affordability.downPayment / (this.affordability.downPayment + j)) *
        100 <
      this.affordability.minDownPayment
    ) {
      this.error(
        'Down Payment must be at least ' +
          this.affordability.minDownPayment +
          '%'
      )
      var g = this.round2((e * 100) / (100 - this.affordability.minDownPayment))
      this.affordability.downPayment = g - e
    } else {
      var g = this.round2(e + this.affordability.downPayment)
    }
    jQuery('[name=income]', this.affordability.$form).val(
      this.format(this.affordability.income)
    )
    jQuery('[name=propertyTaxes]', this.affordability.$form).val(
      this.format(this.affordability.propertyTaxes)
    )
    jQuery('[name=condoFees]', this.affordability.$form).val(
      this.format(this.affordability.condoFees)
    )
    jQuery('[name=heatingCost]', this.affordability.$form).val(
      this.format(this.affordability.heatingCost)
    )
    jQuery('[name=loans]', this.affordability.$form).val(
      this.format(this.affordability.loans)
    )
    jQuery('[name=downPayment]', this.affordability.$form).val(
      this.format(this.affordability.downPayment, true)
    )
    jQuery('[name=interest]', this.affordability.$form).val(
      this.round2(this.affordability.interest)
    )
    jQuery('[name=amortization]', this.affordability.$form).val(
      this.format(this.affordability.amortization)
    )
    jQuery('.affordability-amount', this.affordability.$result).html(
      '$' + this.format(g, true)
    )
    jQuery('.affordability-payment', this.affordability.$result).html(
      '$' + this.format(b, true)
    )
    jQuery('.affordability-principal', this.affordability.$result).html(
      '$' + this.format(j, true)
    )
    if (this.affordability.chart) {
      var d = google.visualization.arrayToDataTable([
        ['Type', 'Amount'],
        ['Mortgage', this.round2(j)],
        ['Down Payment', this.round2(this.affordability.downPayment)],
        ['Insurance', this.round2(m)],
        ['Interest', this.round2(this.affordability.amortization * 12 * b - j)]
      ])
      var h = new google.visualization.PieChart(this.affordability.$chart[0])
      h.draw(d, {
        height: 250,
        width: '100%',
        pieHole: 0.4,
        backgroundColor: 'transparent',
        tooltip: { showColorCode: true, format: '$#,###.##' },
        chartArea: { left: 0, top: 10, height: 230, width: '100%' },
        legend: 'right'
      })
    }
  }
  this.drawOwnership = function () {
    this.ownership.$container = jQuery('#' + this.ownership.container)
    if (!this.ownership.$container.length) {
      throw new Error('No contaier defined to hold the ownership calculator')
    }
    if (!this.ownership.footer_link && this.ownership.$container.html() != '') {
      this.ownership.footer_link = this.ownership.$container.html()
      this.ownership.$container.empty()
    }
    this.ownership.$container
      .addClass('calculator-ownership')
      .append(
        '<div class="calculator-title">' + this.ownership.title + '</div>'
      )
    if (this.ownership.logo) {
      jQuery('.calculator-title', this.ownership.$container)
        .addClass('calculator-logo')
        .append('<img src="' + this.ownership.logo + '">')
        .append('<br style="clear:both">')
    }
    this.ownership.$form = jQuery(
      '<form> \
      <div class="calculator-row"><i alt="The purchase price of the home you would like to purchase">i</i><label><b>Anticipated Home Price</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="price" size="10" /></label></div> \
      <div class="calculator-row calculator-amount"><i alt="The amount of money you have saved for a down payment">i</i><label><b>Down Payment</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="downPayment" size="10" /></label></div> \
      <div class="calculator-row calculator-amortization"><i alt="The actual number of years it will take for you to repay your mortgage in full. This may go beyond the mortgage term">i</i><label><b>Amortization</b>years <input style="color: rgb(4, 4, 4);" type="text" name="amortization" size="6" /></label></div> \
      <div class="calculator-row"><i alt="The desired term for the mortgage">i</i><label><b>Product</b><select style="color: rgb(4, 4, 4);" name="product"><option value="custom">Custom Rate</option></select></label></div> \
      <div class="calculator-row"><i alt="That percent of interest that you will be paying on the mortgage for a specific term">i</i><label><b>Interest rate</b>% <input style="color: rgb(4, 4, 4);" type="text" name="interest" size="6" /></label></div> \
      <div class="calculator-row"><i alt="The percentage by which you anticipate your home will increase in value each year">i</i><label><b>Anticipated Home Value Increase</b>% <input style="color: rgb(4, 4, 4);" type="text" name="priceIncrease" size="6" /></label></div> \
      <div class="calculator-row"><i alt="The dollar amount of rent you are currently paying each month">i</i><label><b>Current Monthly Rent</b>$ <input style="color: rgb(4, 4, 4);" type="text" name="rent" size="8" /></label></div> \
      <div class="calculator-row"><i alt="The percentage by which you expect your rental payments to be increased each year">i</i><label><b>Anticipated Annual Rent Increase</b>% <input style="color: rgb(4, 4, 4);" type="text" name="rentIncrease" size="6" /></label></div> \
      <div class="calculator-row"><i alt="The number of years that you want to compare owning versus renting your home">i</i><label><b>Comparison Timeframe</b>years <input style="color: rgb(4, 4, 4);" type="text" name="timeframe" size="8" /></label></div> \
      </form>'
    )
    this.ownership.$container.append(this.ownership.$form)
    this.ownership.$result = jQuery(
      '<div class="calculator-ownership-result"></div>'
    )
    this.ownership.$container.append(this.ownership.$result)
    if (this.ownership.chart) {
      this.ownership.$chart = jQuery(
        '<div class="calculator-chart">Loading chart...</div>'
      )
      this.ownership.$container.append(this.ownership.$chart)
    } else {
      this.ownership.$form.css('width', '100%')
    }
    this.ownership.$container.append(
      '<div class="calculator-footer"><div class="calculator-link">' +
        this.ownership.footer_link +
        '</div>Powered by <a href="http://www.home.ca/" onclick="return !window.open(this.href)">home.ca</a></div>'
    )
    jQuery('input, select', this.ownership.$form).val(function () {
      if (Calculator.ownership[this.name]) {
        return Calculator.ownership[this.name]
      } else {
        throw new Error('Unknown field ' + this.name)
      }
    })
    jQuery('input, select', this.ownership.$form).change(function () {
      Calculator.updateOwnership()
    })
    jQuery('i', this.ownership.$form).hover(
      function () {
        Calculator.tooltip(this)
      },
      function () {
        Calculator.tooltip(false)
      }
    )
    this.cssOwnership()
    if (this.ownership.chart) {
      jQuery(window)
        .resize(function () {
          if (Calculator.ownership.$container.width() < 601) {
            Calculator.ownership.$container.addClass('calculator-mobile')
          } else {
            Calculator.ownership.$container.removeClass('calculator-mobile')
          }
          if (Calculator.chart && window.google) {
            Calculator.update()
          }
        })
        .trigger('resize')
    }
  }
  this.cssOwnership = function () {
    if (this.ownership.colorBackground) {
      this.ownership.$container.css(
        'background-color',
        this.ownership.colorBackground
      )
    }
    if (this.ownership.colorText) {
      this.ownership.$container.css('color', this.ownership.colorText)
    }
    if (this.ownership.fontFamily) {
      this.ownership.$container.css('font-family', this.ownership.fontFamily)
    }
    if (this.ownership.fontSize) {
      this.ownership.$container.css('font-size', this.ownership.fontSize + 'px')
    }
    if (this.ownership.colorInfo) {
      jQuery('i', this.ownership.$container).css(
        'background-color',
        this.ownership.colorInfo
      )
    }
    if (this.ownership.width) {
      this.ownership.$container.width(this.ownership.width)
    }
    if (this.ownership.layout == 'vertical') {
      this.ownership.$container.addClass('calculator-vertical')
    }
    if (this.ownership.layout == 'formless') {
      this.ownership.$form.hide()
    }
  }
  this.updateOwnership = function () {
    this.ownership.price = this.validNumber(
      jQuery('[name=price]', this.ownership.$form).val(),
      this.ownership.minPrice
    )
    this.ownership.amortization = this.validNumber(
      jQuery('[name=amortization]', this.ownership.$form).val(),
      1,
      this.ownership.maxAmortization
    )
    this.ownership.downPayment = this.validNumber(
      jQuery('[name=downPayment]', this.ownership.$form).val(),
      0
    )
    this.ownership.interest = this.validNumber(
      jQuery('[name=interest]', this.ownership.$form).val(),
      this.ownership.minInterest
    )
    this.ownership.priceIncrease = this.validNumber(
      jQuery('[name=priceIncrease]', this.ownership.$form).val()
    )
    this.ownership.rent = this.validNumber(
      jQuery('[name=rent]', this.ownership.$form).val()
    )
    this.ownership.rentIncrease = this.validNumber(
      jQuery('[name=rentIncrease]', this.ownership.$form).val()
    )
    this.ownership.timeframe = this.validNumber(
      jQuery('[name=timeframe]', this.ownership.$form).val()
    )
    this.ownership.product = jQuery(
      '[name=product]',
      this.ownership.$form
    ).val()
    var q = Math.pow(1 + this.ownership.interest / 100 / 2, 1 / 6) - 1
    var f = this.ownership.price - this.ownership.downPayment
    var a = this.ownership.amortization * 12
    var b = (f * (q * Math.pow(q + 1, a))) / (Math.pow(q + 1, a) - 1)
    var h = this.getSchedule(f, b, q)
    var o = 0
    var g = 0
    var k = 0
    var j = this.ownership.price
    var e = [
      [
        'Years',
        'Rental Payments',
        { role: 'tooltip' },
        'Morgage Payments',
        { role: 'tooltip' },
        'Equity',
        { role: 'tooltip' }
      ]
    ]
    for (var d = 1; d <= this.ownership.timeframe; d++) {
      var n =
        12 *
        this.ownership.rent *
        Math.pow(1 + this.ownership.rentIncrease / 100, d - 1)
      o += n
      j *= 1 + this.ownership.priceIncrease / 100
      var c = d * 12 - 1
      k = h[c].principal_paid + h[c].interest_paid
      g += h[c].interest_paid
      var p = j - h[c].principal
      e.push([
        'Year ' + d,
        Math.round(o),
        '$' + this.format(o),
        Math.round(k),
        '$' + this.format(p),
        Math.round(p),
        '$' + this.format(p)
      ])
    }
    var r =
      'After <b>' +
      this.ownership.timeframe +
      '</b> years you will have accumulated <b>$' +
      this.format(p, true) +
      '</b> equity in your home'
    if (o > k) {
      r +=
        ' and your mortgage payments will be <b>$' +
        this.format(o - k, true) +
        '</b> less than your rental payments over the same time period'
    }
    this.ownership.$result.html(r + '.')
    jQuery('[name=price]', this.ownership.$form).val(
      this.format(this.ownership.price)
    )
    jQuery('[name=amortization]', this.ownership.$form).val(
      this.ownership.amortization
    )
    jQuery('[name=downPayment]', this.ownership.$form).val(
      this.format(this.ownership.downPayment)
    )
    jQuery('[name=interest]', this.ownership.$form).val(
      this.round2(this.ownership.interest)
    )
    jQuery('[name=priceIncrease]', this.ownership.$form).val(
      this.round2(this.ownership.priceIncrease)
    )
    jQuery('[name=rent]', this.ownership.$form).val(
      this.format(this.ownership.rent)
    )
    jQuery('[name=rentIncrease]', this.ownership.$form).val(
      this.round2(this.ownership.rentIncrease)
    )
    jQuery('[name=timeframe]', this.ownership.$form).val(
      this.ownership.timeframe
    )
    if (this.ownership.chart) {
      var l = new google.visualization.ColumnChart(this.ownership.$chart[0])
      l.draw(google.visualization.arrayToDataTable(e), {
        height: this.ownership.$form.height() - this.ownership.$result.height(),
        width: '100%',
        backgroundColor: 'transparent',
        vAxis: { format: '$#,###.##' },
        chartArea: { left: 80, top: 30, width: '100%' },
        legend: 'bottom',
        focusTarget: 'category'
      })
    }
  }
  return this
})()
if (window.mortgageCalculator) {
  Calculator.setOptions('mortgage', mortgageCalculator)
}
if (window.affordabilityCalculator) {
  Calculator.setOptions('affordability', affordabilityCalculator)
}
if (window.ownershipCalculator) {
  Calculator.setOptions('ownership', ownershipCalculator)
}
Calculator.init()
