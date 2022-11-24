
$("#corazones").append(`  

<!-- anima corazones -->
<div class="container">                
    <svg id="theSvg" viewBox="-120 -30 240 180" enable-background="new 0 0 174 148" xml:space="preserve">
        <defs>
            <filter id="f" filterUnits="userSpaceOnUse"  x="-120" y="-30" width="120%" height="120%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"></feGaussianBlur>
                <feOffset in="blur" dx="3" dy="5" result="shadow"></feOffset>
                <feFlood flood-color="rgba(3,0,0,1)" result="color" />
                <feComposite in ="color" in2="shadow" operator="in" />
                <feComposite in="SourceGraphic"/>
            </filter>
            <path id = "shape"
            d="M0, 21.054 
            C0, 21.054 24.618, -15.165 60.750, 8.554 
            C93.249, 29.888 57.749, 96.888 0, 117.388
            C-57.749, 96.888  -93.249, 29.888 -60.750, 8.554
            C-24.618, -15.165  -0, 21.054 -0, 21.054z    
            "/>
            
            <path id="partialPath" />                  
        </defs> 

        <text dy="-2" filter="url(#f)">
            <textPath xlink:href="#partialPath"  startOffset="12">Queremos que conozcas las historias de vida del hogar :) </textPath> 
        </text>

        <use id="useThePath" xlink:href="#partialPath" stroke="white" stroke-width=".5" stroke-opacity=".5" fill="none" style="display:none;" />
    </svg>

</div>

<!-- fin anima corazones -->

`);



//funcion corazon animado

function Corazones(){


    let rid = null; // request animation id
    const SVG_NS = "http://www.w3.org/2000/svg";
    const pathlength = shape.getTotalLength();
    
    let t = 0; // at the begining of the path
    let lengthAtT = pathlength * t;
    
    let d = shape.getAttribute("d");
    
    // 1. build the d array
    let n = d.match(/C/gi).length; // how many times
    
    let pos = 0; // the position, used to find the indexOf the nth C
    
    class subPath {
      constructor(d) {
        this.d = d;
        this.get_PointsRy();
        this.previous = subpaths.length > 0 ? subpaths[subpaths.length - 1] : null;
        this.measurePath();
        this.get_M_Point(); //lastPoint
        this.lastCubicBezier;
        this.get_lastCubicBezier();
      }
    
      get_PointsRy() {
        this.pointsRy = [];
        let temp = this.d.split(/[A-Z,a-z\s,]/).filter(v => v); // remove empty elements
        temp.map(item => {
          this.pointsRy.push(parseFloat(item));
        }); //this.pointsRy numbers not strings
      }
    
      measurePath() {
        let path = document.createElementNS(SVG_NS, "path");
        path.setAttributeNS(null, "d", this.d);
        // no need to append it to the SVG
        // the lengths of every path in dry
        this.pathLength = path.getTotalLength();
      }
    
      get_M_Point() {
        if (this.previous) {
          let p = this.previous.pointsRy;
          let l = p.length;
          this.M_point = [p[l - 2], p[l - 1]];
        } else {
          let p = this.pointsRy;
          this.M_point = [p[0], p[1]];
        }
      }
    
      get_lastCubicBezier() {
        let lastIndexOfC = this.d.lastIndexOf("C");
        let temp = this.d
        .substring(lastIndexOfC + 1)
        .split(/[\s,]/)
        .filter(v => v);
        let _temp = [];
        temp.map(item => {
          _temp.push(parseFloat(item));
        });
        this.lastCubicBezier = [this.M_point];
        for (let i = 0; i < _temp.length; i += 2) {
          this.lastCubicBezier.push(_temp.slice(i, i + 2));
        }
      }
    }
    
    let subpaths = [];
    
    // create new subPaths
    for (let i = 0; i < n; i++) {
      // finds the of nth C in d
      let newpos = d.indexOf("C", pos + 1);
      if (i > 0) {
        // if it's not the first C
        let sPath = new subPath(d.substring(0, newpos));
        subpaths.push(sPath);
      }
      //change the value of the position pos
      pos = newpos;
    }
    // at the end add d to the subpaths array
    subpaths.push(new subPath(d));
    
    // 2. get the index of the bezierLengths where the point at t is
    let index;
    for (index = 0; index < subpaths.length; index++) {
      if (subpaths[index].pathLength >= lengthAtT) {
        break;
      }
    }
    
    function get_T(t, index) {
      let T;
      lengthAtT = pathlength * t;
      if (index > 0) {
        T =
          (lengthAtT - subpaths[index].previous.pathLength) /
          (subpaths[index].pathLength - subpaths[index].previous.pathLength);
      } else {
        T = lengthAtT / subpaths[index].pathLength;
      }
      //console.log(T)
      return T;
    }
    
    let T = get_T(t, index);
    
    let newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier);
    
    drawCBezier(newPoints, partialPath, index);
    
    function getBezierPoints(t, points) {
      let helperPoints = [];
    
      // helper points 0,1,2
      for (let i = 1; i < 4; i++) {
        //points.length must be 4 !!!
        let p = lerp(points[i - 1], points[i], t);
        helperPoints.push(p);
      }
    
      // helper points 3,4
      helperPoints.push(lerp(helperPoints[0], helperPoints[1], t));
      helperPoints.push(lerp(helperPoints[1], helperPoints[2], t));
    
      // helper point 5 is where the first Bézier ends and where the second Bézier begins
      helperPoints.push(lerp(helperPoints[3], helperPoints[4], t));
    
      // points for the dynamic bézier
      let firstBezier = [
        points[0],
        helperPoints[0],
        helperPoints[3],
        helperPoints[5]
      ];
      //console.log(firstBezier)
      return firstBezier;
    }
    
    function lerp(A, B, t) {
      // a virtual line from A to B
      // get the position of a point on this line
      // if(t == .5) the point in in the center of the line
      // 0 <= t <= 1
      let ry = [
        (B[0] - A[0]) * t + A[0], //x
        (B[1] - A[1]) * t + A[1] //y
      ];
      return ry;
    }
    
    function drawCBezier(points, path, index) {
      let d;
    
      if (index > 0) {
        d = subpaths[index].previous.d;
      } else {
        d = `M${points[0][0]},${points[0][1]} C`;
      }
    
      // points.length == 4
      for (let i = 1; i < 4; i++) {
        d += ` ${points[i][0]},${points[i][1]} `;
      }
      //console.log(d)
      partialPath.setAttributeNS(null, "d", d);
    }
    
    /*
    _t.addEventListener("input", ()=>{
      t = _t.value;
      lengthAtT = pathlength*t;
      for(index = 0; index < subpaths.length; index++){
    if(subpaths[index].pathLength >= lengthAtT){break; }  
    }
      T = get_T(t, index); 
      newPoints = getBezierPoints(T,subpaths[index].lastCubicBezier);
      drawCBezier(newPoints, partialPath, index);
    })*/
    
    t = 0.025;
    function Typing() {
      rid = window.requestAnimationFrame(Typing);
      if (t >= 1) {
        window.cancelAnimationFrame(rid);
        rid = null;
      } else {
        t += 0.0025;
      }
    
      lengthAtT = pathlength * t;
      for (index = 0; index < subpaths.length; index++) {
        if (subpaths[index].pathLength >= lengthAtT) {
          break;
        }
      }
      T = get_T(t, index);
      newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier);
      drawCBezier(newPoints, partialPath, index);
    }
    
    Typing();
    theSvg.addEventListener("click", () => {
      if (rid) {
        window.cancelAnimationFrame(rid);
        rid = null;
      } else {
        if (t >= 1) {
          t = 0.025;
        }
        rid = window.requestAnimationFrame(Typing);
      }
    });
    useThePath.style.display = "block";
        
    cb.addEventListener("input", () => {
      if (cb.checked) {
        useThePath.style.display = "block";
      } else {
        useThePath.style.display = "none";
      }
    }); 
  
  }  
  
  window.setInterval(Corazones, 8000);






















//
//borra todos los svg
//setInterval(() => {
 //   $("#contactanos").hide(1200)
//                    .delay(200)               
//                    .show(1000)     
//                    .animate({fontSize: '1cm', color: "#986ded", opacity: '0.6'}, 600)
//                    .delay(600)
//                    .animate({fontSize: '1cm', opacity: '0.8'}, 600);
    
//}, 5000);


//borra todos los svg
//$(".svg-icono").hide();

//letras titulo en h3
//$("h3-letras")
//    .animate({fontSize: '0,5cm', opacity: '0.7'}, 200)
//    .delay(100)
//    .animate({fontSize: '0,5cm', opacity: '0.9'}, 200);


//anima redes    
//$("#redes")
//    .animate({opacity: 0.4,
//                opacity: 1,
//                width: '100px',                
//                height: '100px',
//                margin: '10px',
//                padin: '5px',
//                border: '5px',
//}, 800, somos);
