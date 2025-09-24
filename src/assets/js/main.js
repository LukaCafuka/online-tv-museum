// Basic jQuery UI initialization
$(function() {
  // Initialize any tab sets present (support both ids)
  ['#gear-tabs', '#equipment-tabs'].forEach(sel => {
    if($(sel).length) {
      $(sel).tabs();
    }
  });

  // Hover state mimic for cards
  $('.gear-item').hover(function(){
    $(this).addClass('ui-state-hover');
  }, function(){
    $(this).removeClass('ui-state-hover');
  });

  // Lightbox / modal for gallery and hero images + navigation
  let galleryList = [];
  let galleryIndex = -1;
  function buildGalleryList() {
    galleryList = $('.gallery-thumb').map(function(){
      const a = this; const img = $(a).find('img')[0];
      return { href: a.getAttribute('href') || img.src, alt: img.alt || '' };
    }).get();
  }
  function openLightbox(src, alt, keep=false) {
    if(!keep) buildGalleryList();
    const $lb = $('#lightbox');
    $('#lightbox-img').attr('src', src);
    $('#lightbox-caption').text(alt || '');
    $('#lightbox-open-original').attr('href', src);
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
    openLightbox(g.href, g.alt, true);
  }
  function closeLightbox() {
    $('#lightbox').addClass('hidden');
    $('body').removeClass('lightbox-open');
    $('#lightbox-img').attr('src','');
  }
  $(document).on('click', '.gallery-thumb', function(e){
    e.preventDefault();
    const img = $(this).find('img')[0];
    openLightbox($(this).attr('href') || img.src, img.alt);
  });
  $(document).on('click', '.detail-image', function(){
    openLightbox(this.src, this.alt);
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
