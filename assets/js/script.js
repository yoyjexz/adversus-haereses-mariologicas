const INDEX_MD = "index.md";

function sanitizeString(str){
  str = str.replace(/[^0-9A-Za-z\._-]/gim,"");
  return str.trim();
}

function replaceHref() {
  var elems = document.getElementsByTagName('a');
  for(let i =0; i < elems.length; i++) { 
    var elem = elems[i];
    var href_attr = elem.getAttribute('href');
    if(href_attr.substring(0, 4) == '?md=') {
      var file_md = href_attr.substring(4);
      elem.setAttribute('href', 'javascript:void(0)');
      elem.setAttribute('onclick', 'setTextAndState("' + file_md + '", "' + file_md + '")');
    }
  }
}

function setVisibility(name, set) {
  var x = document.getElementById(name);
  if(set) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function toggle(name) {
  var x = document.getElementById(name);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function setContentEnd(md) {
  if(md != INDEX_MD) {
    var host = window.location.protocol + "//" + window.location.host;
    document.getElementById("url-toggle").innerHTML = 
      '<i>' + host + '/?md=' + md + '</i>';
    setVisibility("end", true);
  }
}

function setTextAndState(md, state_name) {
  window.history.replaceState(state_name, '', '/?md=' + md);
  setText(md);
}

function returnToIndex() {
  window.history.replaceState('Inicio', '', '/');
  setText(INDEX_MD);
}

function setText(md){
  // Change view of main to loading
  window.scrollTo(0,0);
  document.getElementById('content').innerHTML = "";
  setVisibility('end', false);
  setVisibility('loading', true);

  // Sanitize and generate url
  var md_sanitized = sanitizeString(md);
  var request = new XMLHttpRequest();
  var url = "docs/md/" + md_sanitized;

  // Request
  request.open('GET', url, true);
  request.send(false)
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      // Correct
      if (request.status === 200) {
        var type = request.getResponseHeader('Content-Type');
        if (type.indexOf("text") !== 1) {
          setVisibility('loading', false);

          var md_text = request.responseText;
          document.getElementById('content').innerHTML =
            new marked.Marked()
                  .use(markedFootnote({description:'', footnoteDivider:true}))
                  .parse(md_text)

          replaceHref();
          setContentEnd(md_sanitized);
        }
      }

      // Not found
      if (request.status === 404) {
        setVisibility('loading', false);
        document.getElementById('content').innerHTML =
          marked.parse("# Error 404\nPágina no encontrada.");
        setContentEnd('404.md');
      }
    }
  }
}

function main() {
  var params = new URLSearchParams(document.location.search);
  var md = params.get('md');
  if(!md) md = INDEX_MD;
  setText(md);
}

document.addEventListener('DOMContentLoaded', function() {
  main();
});

