$.getJSON("https://raw.githubusercontent.com/kmcelwee/fortune-100-blm-report/main/docs/handle-mapper.json", (data) => {
    var corp2handle = data['corp2handle'];
    var handle2corp = data['handle2corp'];

    $('.corp_link').each(function() {
        var handle = corp2handle[$(this).text()];
        if (!handle) {handle = $(this).attr('handle')}
        if (!handle) {console.log('PROBLEM!'); console.log($(this).text())}
        $(this).attr('href', `https://kmcelwee.github.io/fortune-100-blm-report/site/corporate-summaries.html#${handle}`)
        $(this).attr('target', '_blank')
        $(this).append(`<img src="img/icon-histogram-2.png" alt="histogram icon" class="histogram_icon">`)
    })
})
