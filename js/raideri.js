var basket = {
  items: []
}

$(document).keyup(function(e) {
  var esc = 27
  if (e.keyCode == esc) {
    $('#search')
      .val("")
      .next('.icon_clear').fadeTo(300, 0)
      .prev('input').val('')
      .trigger('keyup')
      .focus()
    return false
  }
})

$(window).load(function() {
  addItemsFromUrl()
  validateInputFields()

  $("input[id='search']").focus()

  function addItemsFromUrl() {
    var kplArray = getQueryVariable('kpl')
    var eanArray = getQueryVariable('ean')
    var client = getQueryVariable('client')
    var name = getQueryVariable('name')
    var address = getQueryVariable('address')

    $.getJSON('products.json', function (data) {
      for (var i in eanArray) {
        var kpl = kplArray[i]
        ean = eanArray[i]
        for (j = 0; j < kpl; j++)
          addToBasket(ean)
      }
    })

    $('#name').val(name)
    $('#client').val(client)
    $('#address').val(decodeURIComponent(address))
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1)
    var vars = query.split("&")
    var retval = []
    for (var i=0; i<vars.length; i++) {
      var pair = vars[i].split("=")
      if(pair[0] == variable)
        retval.push(pair[1])
    }
    return retval
  }

  $('#search').keyup(function() {
    var io = $('#search').val().length ? 1 : 0
    $('#search').next('.icon_clear').stop().fadeTo(300,io)
    var searchField = $('#search').val()
    var regex = new RegExp(searchField, "i")
    var output = '<ul class="list img-list">'
    var count = 0
    $.getJSON('products.json', function(data) {
      $.each(data, function(key, val) {
        if ((val.nimike.search(regex) != -1) || (val.kuvaus.search(regex) != -1)) {
          hiliteterm = searchField.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*")
          var pattern = new RegExp("(" + hiliteterm + ")", "gi")
          output += '<li class="productresult" id="' + val.ean + '">'
          output += '<div class="li-img"><img class="productimage" src="./img/' + val.ean + '.jpg" alt="' + val.nimike + '" /></div>'
          output += '<div class="li-text"><h4 class="li-head nimike" data-value="' + val.nimike + '">' + val.nimike.replace(pattern, "<mark>$1</mark>") + '</h4>'
          output += '<p class="li-sub kuvaus" data-value="' + val.kuvaus + '">' + val.kuvaus.replace(pattern, "<mark>$1</mark>") + '</p>'
          output += '<input type="hidden" class="ean" value="' + val.ean + '" />'
          output += '</div></li>'
          count++
        }
      })
      if (count === 0 && (searchField.indexOf("kalja") >= 0) || searchField.indexOf("olut") >= 0 ) {
        output += '<li class="noproductresult" id="keke"><div class="li-img"><img style="width: 200px;" class="productimage" src="./img/suurkeke.png" alt="keke" /></div>'
        output += '<div class="li-text"><p style="text-align: center;" class="li-head nimike">JUOPPO!</p></div></li>'
      }
      else if (count === 0) {
        output += '<li class="noproductresult" id="keke"><div class="li-img"><img style="width: 200px;" class="productimage" src="./img/suurkeke.png" alt="keke" /></div>'
        output += '<div class="li-text"><p style="text-align: center;" class="li-head nimike">HAHAHA EI LÖYTYNYT</p></div></li>'
      }
      output += '</ul>'
      $('#results').html(output)
    })
  })

  $('.icon_clear').click(function() {
    $(this).delay(300).fadeTo(300, 0)
      .prev('input').val('')
    $('#search').focus().trigger('keyup')
  })

  $('#results').on('click', '.productresult', function(e) {
    var ean = $(this).attr("id")
    $(this).fadeIn(50).fadeOut(50).fadeIn(50)
    addToBasket(ean)
  })

  $('.rightColumn input[type=text]').each(function() {
    $(this).keyup(function() {
      createUrlToBasket()
      validateInputFields()
    })
  })

  function validateInputFields() {
      console.log("validate input fields")
    $('.rightColumn input[type=text]').each(function() {
      if ($(this).val() == '')
        $(this).addClass('invalid')
      else
        $(this).removeClass('invalid')
    })
    checkIfCanBeSent()
  }

  function checkIfCanBeSent() {
    if ($('.rightColumn .invalid').length == 0)
      $('input:button#sendorder').removeAttr('disabled')
    else
      $('input:button#sendorder').attr('disabled', 'disabled')

    console.log($('.rightColumn .invalid').length == 0, basket.items.length > 0)
  }

  function addToBasket(eanToAdd) {
    $.getJSON('products.json', function (data) {
      $.each(data, function (key, val) {
        if (val.ean.search(eanToAdd) != -1) {
          var item = {
            nimike: val.nimike,
            ean: val.ean,
            kuvaus: val.kuvaus,
            kpl: 1
          }
          var increased = false

          for (var i = 0; i < basket.items.length; i++) {
            if (basket.items[i].ean == eanToAdd) {
              basket.items[i].kpl++
              increased = true
            }
          }
          if (!increased) {
            basket.items.push(item)
          }
        }
      })
      updateBasketHtml()
    })
  }

  function emptyBasket() {
    var basketSize = basket.items.length
    basket.items.splice(0, basketSize)
    updateBasketHtml()
  }

  function createUrlToBasket() {
    var newUrlEnd = ''
    for (i=0; i<basket.items.length; i++) {
      var kpl = basket.items[i].kpl
      var ean = basket.items[i].ean
      newUrlEnd += "&kpl="+kpl+"&ean="+ean
    }
    var name = $('#name').val()
    var client = $('#client').val()
    var address = encodeURIComponent($('#address').val())
    newUrlEnd += "&name="+name+"&client="+client+"&address="+address

    var currentUrl = window.location.href.split('?')[0]
    newUrlEnd = newUrlEnd.split(/&(.+)?/)[1] // take out first '&'
    var newUrl = currentUrl + "?" + newUrlEnd

    $('.urlToBasket').toggle(basket.items.length > 0)
    $('.emptyBasket').toggle(basket.items.length > 0)
    $('.urlToBasket').html("<a href="+newUrl+">Linkki koriin</a>")
  }

  $('#basket').on('click', '.reduce', function(e) {
    var id = $(this).attr("data-ean-remove")
    for (var i = 0; i < basket.items.length; i++) {
      if (basket.items[i].ean == id) {
        if (basket.items[i].kpl == 1) {
          basket.items.splice(i, 1)
        } else {
          basket.items[i].kpl--
          $(this).prev().fadeIn(50).fadeOut(100).fadeIn(100)
          reduced = true
        }
      }
    }
    $('.urlToBasket').toggle(basket.items.length > 0)
    updateBasketHtml()
  })

  function updateBasketHtml() {
    $('#basket #basketcontents').html('')
    $.each(basket.items, function(index, value) {
      $('#basket #basketcontents').append("<b>" + value.kpl + " kpl " + "</b>" + value.nimike + "<br/>" + value.kuvaus + " <span class=\"reduce\" data-ean-remove='" + value.ean + "'><img src=\"img/x.png\" /></span>")
    })
    createUrlToBasket()
  }

  $('.emptyBasket').click(function() {
    emptyBasket()
  })

  $('#search').trigger('keyup')

  $('#sendorder').click(function(e) {
    var email = 'kespro.myynti@kesko.fi'
    var cc = 'ostot@reaktor.fi'
    var subject = 'Tilaus, Reaktor, '+$('#client').val()+', '+$('#name').val()
    var body = 'Hei, tässä tämänkertainen tilaus osoitteeseen ' + $('#address').val() + '.\n\n Tilauksen vastaanottamisessa auttavat <INSERT HENKILÖT HERE>. \n\nTilauksen sisältö: \n\n'
    var basketitems = ''

    for (var i = 0; i < basket.items.length; i++) {
      basketitems += basket.items[i].kpl + ' kpl ' + basket.items[i].nimike + ' ' +  basket.items[i].kuvaus + ' (' + basket.items[i].ean + ')\n'
    }
    if (basketitems.length > 1200){
      $("#ex1").html("<p>Ostoslista on liian pitkä, kopioi se alta ja liitä viestiin.</p><br/><br/><p class=\"modal\">" + basketitems.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</p><br/><br/><a href="mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '" >Avaa sähköposti tästä</a><br/><br/><a rel="modal:close">Sulje</a>')
      $("#ex1").modal({
        fadeDuration: 200,
        showClose: false
      })
    }
    else{
      window.location = 'mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body + basketitems)
    }
  })

})


