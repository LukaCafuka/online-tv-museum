// Basic jQuery UI initialization
$(function() {
  // Initialize any tab sets present (support both ids)
  ['#gear-tabs', '#equipment-tabs'].forEach(sel => {
    if($(sel).length) {
      $(sel).tabs();
    }
  });

  // Dark mode toggle
  $('#theme-toggle').on('click', function() {
    var isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e) {}
  });

  // Hover state mimic for cards
  $('.gear-item').hover(function(){
    $(this).addClass('ui-state-hover');
  }, function(){
    $(this).removeClass('ui-state-hover');
  });

  // Search and category filter
  (function() {
    var $search = $('#gear-search');
    var $items = $('#gear-grid .gear-item');
    var $catBtns = $('.cat-btn');
    var $noResults = $('#gear-no-results');
    if (!$items.length) return;

    var activeCat = 'all';

    function applyFilters() {
      var query = ($search.val() || '').toLowerCase().trim();
      var visible = 0;

      $items.each(function() {
        var $el = $(this);
        var matchesCat = activeCat === 'all' || $el.data('category') === activeCat;
        var matchesSearch = !query || ($el.data('search') || '').indexOf(query) !== -1;
        var show = matchesCat && matchesSearch;
        $el.toggle(show);
        if (show) visible++;
      });

      $noResults.prop('hidden', visible > 0);
    }

    $search.on('input', applyFilters);

    $catBtns.on('click', function() {
      $catBtns.removeClass('active ui-state-active');
      $(this).addClass('active ui-state-active');
      activeCat = $(this).data('category');
      applyFilters();
    });
  })();

  // Lightbox / modal for gallery and hero images + navigation
  let galleryList = [];
  let galleryIndex = -1;
  function buildGalleryList() {
    galleryList = $('.gallery-thumb').map(function(){
      const a = this; const img = $(a).find('img')[0];
      return { 
        href: a.getAttribute('href') || img.src, 
        alt: img.alt || '',
        original: a.getAttribute('data-original') || a.getAttribute('href') || img.src
      };
    }).get();
  }
  function openLightbox(src, alt, original, keep=false) {
    if(!keep) buildGalleryList();
    const $lb = $('#lightbox');
    $('#lightbox-img').attr('src', src);
    $('#lightbox-caption').text(alt || '');
    $('#lightbox-open-original').attr('href', original || src);
    galleryIndex = galleryList.findIndex(g => g.href === src);
    $lb.removeClass('hidden');
    $('body').addClass('lightbox-open');
    setTimeout(()=>$('#lightbox .lightbox-close').focus(), 0);
  }
  function navigate(delta) {
    if(galleryList.length < 2) return;
    if(galleryIndex === -1) galleryIndex = 0;
    galleryIndex = (galleryIndex + delta + galleryList.length) % galleryList.length;
    const g = galleryList[galleryIndex];
    openLightbox(g.href, g.alt, g.original, true);
  }
  function closeLightbox() {
    $('#lightbox').addClass('hidden');
    $('body').removeClass('lightbox-open');
    $('#lightbox-img').attr('src','');
  }
  $(document).on('click', '.gallery-thumb', function(e){
    e.preventDefault();
    const img = $(this).find('img')[0];
    const original = $(this).attr('data-original') || $(this).attr('href') || img.src;
    openLightbox($(this).attr('href') || img.src, img.alt, original);
  });
  $(document).on('click', '.detail-image', function(){
    // Hero images don't have data-original, so they use the optimized version for both display and full image
    openLightbox(this.src, this.alt, this.src);
  });
  $(document).on('click', '.lightbox-backdrop, .lightbox-close', function(){
    closeLightbox();
  });
  $(document).on('click', '.lb-prev', function(){ navigate(-1); });
  $(document).on('click', '.lb-next', function(){ navigate(1); });
  $(document).on('keyup', function(e){
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowRight') navigate(1);
    if(e.key === 'ArrowLeft') navigate(-1);
  });
});
