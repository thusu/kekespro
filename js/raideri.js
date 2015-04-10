var basket = {
  items: []
};

$(document).keyup(function(e){ 
  if (e.keyCode == 27) { // Esc
    $('#search').val("");
    $('#search').next('.icon_clear').fadeTo(300,0).prev('input').val('');
    $('#search').trigger('keyup');
    return false;
  }
});

$(document).on('click', '.icon_clear', function() {
  $(this).delay(300).fadeTo(300,0).prev('input').val(''); $('#search').focus().trigger('keyup');
}); 

$(window).load(function() {
	
  $("input[id='search']", document.forms[0]).focus();

  $('#search').keyup(function() {

    var io = $('#search').val().length ? 1 : 0 ;
    $('#search').next('.icon_clear').stop().fadeTo(300,io);

    var searchField = $('#search').val();
    var regex = new RegExp(searchField, "i");
    var output = '<ul class="list img-list">';
    var count = 0;

    $.getJSON('products.json', function(data) {
      $.each(data, function(key, val) {
        if ((val.nimike.search(regex) != -1) || (val.kuvaus.search(regex) != -1)) {
          hiliteterm = searchField.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
          var pattern = new RegExp("(" + hiliteterm + ")", "gi");
          output += '<li class="productresult" id="' + val.ean + '">';
          output += '<div class="li-img"><img class="productimage" src="./img/' + val.ean + '.jpg" alt="' + val.nimike + '" /></div>';
          output += '<div class="li-text"><h4 class="li-head nimike" data-value="' + val.nimike + '">' + val.nimike.replace(pattern, "<mark>$1</mark>") + '</h4>';
          output += '<p class="li-sub kuvaus" data-value="' + val.kuvaus + '">' + val.kuvaus.replace(pattern, "<mark>$1</mark>") + '</p>';
          output += '<input type="hidden" class="ean" value="' + val.ean + '" />'
          output += '</div></li>';
          count++;
        }
      });
      if(count === 0){
	output += '<li class="noproductresult" id="keke"><div class="li-img"><img style="width: 200px;" class="productimage" src="./img/suurkeke.png" alt="keke" /></div>';	
        output += '<div class="li-text"><p style="text-align: center;" class="li-head nimike">Ha ha ha ei löytynyt</p></div></li>';
      }
      output += '</ul>';
      $('#results').html(output);
    });
  });

  $('#results').on('click', '.productresult', function(e) {
    var id = "#" + $(this).attr("id");
    var item = {
      nimike: $(id + " .nimike").attr('data-value'),
      ean: $(id + " .ean").val(),
      kuvaus: $(id + " .kuvaus").attr('data-value'),
      kpl: 1
    }
    var increased = false;

    for (var i = 0; i < basket.items.length; i++) {
      if (basket.items[i].ean == $(id + " .ean").val()) {
        basket.items[i].kpl++;
        increased = true;
      }
    }

    if (!increased) {
      basket.items.push(item);
    }
    $(""+id).fadeIn(100).fadeOut(100).fadeIn(100);

    console.log(basket.items);
    $('#basket #basketcontents').html('');
    $.each(basket.items, function(index, value) {
      $('#basket #basketcontents').append("<b>" + value.kpl + " kpl " + "</b>" + value.nimike + "<br/>" + value.kuvaus + " <span class=\"reduce\" data-ean-remove='" + value.ean + "'><img src=\"img/x.png\" /></span><br/><br/>");
    });
  });

  $('#basket').on('click', '.reduce', function(e) {
    var id = $(this).attr("data-ean-remove");
    for (var i = 0; i < basket.items.length; i++) {
      if (basket.items[i].ean == id) {
        if (basket.items[i].kpl == 1) {
          basket.items.splice(i, 1);
        } else {
          basket.items[i].kpl--;
          reduced = true;
        }
      }
    }

    $('#basket #basketcontents').html('');
    $.each(basket.items, function(index, value) {
      $('#basket #basketcontents').append("<b>" + value.kpl + " kpl " + "</b>" + value.nimike + "<br/>" + value.kuvaus + " <span class=\"reduce\" data-ean-remove='" + value.ean + "'><img src=\"img/x.png\" /></span><br/><br/>");

    });

  });
  $('#search').trigger('keyup');

  $('#sendorder').click(function(e){
    var email = 'kespro.myynti@kesko.fi';
    var cc = 'ostot@reaktor.fi';
    var subject = 'Tilaus, Reaktor, ASIAKKUUS, TILAAJA';
    var body = 'Hei, tässä tämänkertainen tilaus osoitteeseen <INSERT OSOITE HERE>.\n\n Tilauksen vastaanottamisessa auttavat <INSERT HENKILÖT HERE>. \n\nTilauksen sisältö: \n\n';

    var basketitems = '';

    for (var i = 0; i < basket.items.length; i++) {
       basketitems += basket.items[i].kpl + ' kpl ' + basket.items[i].nimike + ' ' +  basket.items[i].kuvaus + ' (' + basket.items[i].ean + ')\n'; 
    }
//    basket.items.splice(0,basket.items.length);
//    $('#basket #basketcontents').html('');
//    alert("pituus: " + basketitems.length);
    if(basketitems.length>1200){
	$("#ex1").html("<p>Ostoslista on liian pitkä, kopioi se alta ja liitä viestiin.</p><br/><br/><p class=\"modal\">" + basketitems.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</p><br/><br/><a href="mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '" >Avaa sähköposti tästä</a><br/><br/><a rel="modal:close">Sulje</a>');
	$("#ex1").modal({
  	  fadeDuration: 200,
	  showClose: false
	})
    }
    else{
	window.location = 'mailto:' + email + '?cc=' + cc + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body + basketitems);
    }
  });

});


