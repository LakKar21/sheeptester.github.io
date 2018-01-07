function SVtoSL(s, v) {
  s /= 100, v /= 100;
  var _l = (2 - s) * v;
  _l = [Math.round((s * v) / (_l <= 1 ? _l : 2 - _l) * 100), Math.round(_l * 50)];
  if (isNaN(_l[0])) _l[0] = 0;
  return _l;
}
function hextoHSV(hex) { // is mess.
  let [r,g,b]=hex.match(/.{2}/g).map(a=>parseInt(a,16)),
  max=Math.max(r,g,b),
  min=Math.min(r,g,b),
  d=max-min,
  h,
  s=(max!==0?d/max:0),
  v=max/255;
  switch (max) {
    case min:h=0;break;
    case r:h=(g-b)+d*(g<b?6:0);h/=6*d;break;
    case g:h=(b-r)+d*2;h/=6*d;break;
    case b:h=(r-g)+d*4;h/=6*d;break;
  }
  return [h*360,s*100,v*100].map(Math.round);
}
function HSVtohex(h,s,v) {
  var r,g,b,i,f,p,q,t;
  h/=360,s/=100,v/=100,
  i=Math.floor(h*6),
  f=h*6-i,
  p=v*(1-s),
  q=v*(1-f*s),
  t=v*(1-(1-f)*s);
  switch (i%6) {
    case 0:r=v,g=t,b=p;break;
    case 1:r=q,g=v,b=p;break;
    case 2:r=p,g=v,b=t;break;
    case 3:r=p,g=q,b=v;break;
    case 4:r=t,g=p,b=v;break;
    case 5:r=v,g=p,b=q;break;
  }
  return [r,g,b].map(a=>('0'+Math.round(a*255).toString(16)).slice(-2)).join('');
}

function isSlider(elem, moveFn, doneFn) {
  let move = e => {
    let boundingRect = elem.getBoundingClientRect();
    if (e.type === "mousemove") {
      moveFn(e.clientX - boundingRect.left, e.clientY - boundingRect.top, boundingRect);
    } else if (e.type === "touchmove") {
      moveFn(e.touches[0].clientX - boundingRect.left, e.touches[0].clientY - boundingRect.top, boundingRect);
    }
    e.preventDefault();
  }, up = e => {
    if (e.type === "mouseup") {
      let boundingRect = elem.getBoundingClientRect();
      moveFn(e.clientX - boundingRect.left, e.clientY - boundingRect.top, boundingRect);
      document.removeEventListener("mousemove", move, false);
      document.removeEventListener("mouseup", up, false);
    } else if (e.type === "touchend") {
      document.removeEventListener("touchmove", move, {passive: false});
      document.removeEventListener("touchend", up, {passive: false});
    }
    if (doneFn) doneFn();
    e.preventDefault();
  };
  elem.addEventListener("mousedown", e => {
    let boundingRect = elem.getBoundingClientRect();
    moveFn(e.clientX - boundingRect.left, e.clientY - boundingRect.top, boundingRect);
    document.addEventListener("mousemove", move, false);
    document.addEventListener("mouseup", up, false);
  }, false);
  elem.addEventListener("touchstart", e => {
    let boundingRect = elem.getBoundingClientRect();
    moveFn(e.touches[0].clientX - boundingRect.left, e.touches[0].clientY - boundingRect.top, boundingRect);
    document.addEventListener("touchmove", move, {passive: false});
    document.addEventListener("touchend", up, {passive: false});
  }, false);
}

const currentColour = {h: 174, s: 100, v: 59, a: 1, str: "hsla(174, 100%, 30%, 1)"};
function loadColours() {
  const hsvRect = document.querySelector("#colourrect"),
  hsvRectKnob = document.querySelector("#colourrect span"),
  hsvRectHeight = 100,
  hsvRectWidth = 180,

  sliderWidth = 170,
  sliderSidePadding = 5,
  hueSlider = document.querySelector("#hue"),
  hueSliderKnob = document.querySelector("#hue span"),

  opacitySlider = document.querySelector("#opacity div"),
  opacitySliderKnob = document.querySelector("#opacity span"),
  opacityInput = document.querySelector("#opacityinput input"),

  hexInput = document.querySelector("#hex input");

  function updateElements() {
    let hslConversion = SVtoSL(currentColour.s, currentColour.v),
    saturation = hslConversion[0],
    lightness = hslConversion[1],
    hsl = `hsl(${currentColour.h}, ${saturation}%, ${lightness}%)`;
    hsvRect.style.backgroundColor = `hsl(${currentColour.h}, 100%, 50%)`;
    hsvRectKnob.style.backgroundColor = hsl;
    hsvRectKnob.style.left = (hsvRectWidth * currentColour.s / 100) + "px";
    hsvRectKnob.style.bottom = (hsvRectHeight * currentColour.v / 100) + "px";

    hueSlider.style.backgroundImage = `linear-gradient(
      90deg,
      hsl(0, ${saturation}%, ${lightness}%),
      hsl(60, ${saturation}%, ${lightness}%),
      hsl(120, ${saturation}%, ${lightness}%),
      hsl(180, ${saturation}%, ${lightness}%),
      hsl(240, ${saturation}%, ${lightness}%),
      hsl(300, ${saturation}%, ${lightness}%),
      hsl(0, ${saturation}%, ${lightness}%)
    )`;
    hueSlider.style.backgroundColor = `hsl(0, ${saturation}%, ${lightness}%)`;
    hueSliderKnob.style.left = (sliderWidth * currentColour.h / 360 + sliderSidePadding) + "px";

    opacitySlider.style.backgroundImage = `linear-gradient(270deg, ${hsl}, transparent), linear-gradient(${hsl}, ${hsl})`;
    opacitySliderKnob.style.left = (sliderWidth * currentColour.a + sliderSidePadding) + "px";
    opacityInput.value = Math.round(currentColour.a * 100);

    hexInput.value = HSVtohex(currentColour.h, currentColour.s, currentColour.v);
    currentColour.str = `hsla(${currentColour.h}, ${saturation}%, ${lightness}%, ${currentColour.a})`;
  }
  updateElements();

  isSlider(hsvRect, (x, y) => {
    if (x < 0) x = 0;
    else if (x > hsvRectWidth) x = hsvRectWidth;
    currentColour.s = x / hsvRectWidth * 100;
    if (y < 0) y = 0;
    else if (y > hsvRectHeight) y = hsvRectHeight;
    currentColour.v = (1 - y / hsvRectHeight) * 100;
    updateElements();
  }, addToHistory);
  isSlider(hueSlider, x => {
    x -= sliderSidePadding;
    if (x < 0) x = 0;
    else if (x > sliderWidth) x = sliderWidth;
    currentColour.h = x / sliderWidth * 360;
    updateElements();
  }, addToHistory);
  isSlider(opacitySlider, x => {
    x -= sliderSidePadding;
    if (x < 0) x = 0;
    else if (x > sliderWidth) x = sliderWidth;
    currentColour.a = x / sliderWidth;
    updateElements();
  }, addToHistory);

  opacityInput.addEventListener("change", e => {
    let value = +opacityInput.value.replace(/[^0-9.-]/g, "");
    if (!isNaN(value) && value >= 0 && value <= 100) currentColour.a = value / 100;
    updateElements();
    addToHistory();
  }, false);
  hexInput.addEventListener("change", e => {
    let value = hexInput.value.replace(/[^0-9a-f]/gi, "");
    if (value.length < 5) value = value.split("").map(a => a.repeat(2)).join("");
    if (value.length > 6) value = value.slice(0, 6);
    if (value.length === 6) [currentColour.h, currentColour.s, currentColour.v] = hextoHSV(value);
    updateElements();
    addToHistory();
  }, false);

  const MAX_ROW_ITEMS = 8,
  MAX_ROWS = 4,
  historyCanvas = document.querySelector("#colourhistory"),
  c = historyCanvas.getContext("2d");
  pixelateCanvas(c);

  let history = [];
  function addToHistory() {
    c.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
    if (currentColour.str !== history[0]) history.splice(0, 0, currentColour.str);
    if (history.length > MAX_ROW_ITEMS * MAX_ROWS) history = history.slice(0, MAX_ROW_ITEMS * MAX_ROWS);
    let rows = Math.ceil(history.length / MAX_ROW_ITEMS),
    firstRowItems = history.length % MAX_ROW_ITEMS,
    globalItemWidth = historyCanvas.width / MAX_ROW_ITEMS,
    itemHeight = historyCanvas.height / rows;
    if (firstRowItems === 0) firstRowItems = MAX_ROW_ITEMS;
    for (let i = 0, itemWidth = historyCanvas.width / firstRowItems; i < firstRowItems; i++) {
      c.fillStyle = history[i];
      c.fillRect(i * itemWidth, 0, itemWidth, itemHeight);
    }
    for (let i = 0, row = 0; i < history.length - firstRowItems; i++) {
      if (i % MAX_ROW_ITEMS === 0) row++;
      c.fillStyle = history[i + firstRowItems];
      c.fillRect((i % MAX_ROW_ITEMS) * globalItemWidth, row * itemHeight, globalItemWidth, itemHeight);
    }
  }
  addToHistory();
}