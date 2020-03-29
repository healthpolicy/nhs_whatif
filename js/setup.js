// Global setup ----------------------------------------------------------------

svg
  .style("background", "transparent")
  .style("font-family", '"Trebuchet MS", Helvetica, sans-serif');

var tooltip = d3.select("body").append("div")	
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("font-family", '"Trebuchet MS", Helvetica, sans-serif')
  .style("font-size", "1vw")
  .style("opacity", 0)
  .style("visibility", "hidden")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px");

var story_width = 0.4 * width;


// Global functions ------------------------------------------------------------

var colour_imd_decile = function(x) {
  if (x == 1)       {return "#A11A20";} // most deprived
  else if (x == 2)  {return "#BB4633";}
  else if (x == 3)  {return "#D46B47";}
  else if (x == 4)  {return "#EC8E5C";}
  else if (x == 5)  {return "#CEA384";}
  else if (x == 6)  {return "#A4B5AC";}
  else if (x == 7)  {return "#57C6D5";}
  else if (x == 8)  {return "#41ADB4";}
  else if (x == 9)  {return "#299595";}
  else              {return "#087E76";} // least deprived
};

var round1 = function(x) {return Math.round(x * 10) / 10;};
var calc_x = function(x, svg_w = width) {return round1(x / 100 * svg_w);};
var calc_y = function(y, svg_h = height) {return round1((1 - y / 100) * svg_h);};
var calc_w = function(h, svg_w = width) {return round1(h / 100 * svg_w);};
var calc_h = function(h, svg_h = height) {return round1(h / 100 * svg_h);};
var calc_timebar_pc = function(x) {return round1((x - 1957) / (2020 - 1957));};

var calc_progress = function(progress_px, duration_px) {
  if (progress_px < 0) {
    return 0;
  } else if (progress_px > duration_px) {
    return 1;
  } else {
    return (progress_px / duration_px);
  }
};

var get_anchors = function() {
  var result = [];
  for (i = 0; i < document.getElementsByClassName("scene").length; i++) {
    result.push(document.getElementById("scene" + i).offsetTop);
  }
  return result;
};

var define_visibility = function(current_y, appear, disappear) {
  var show = false;
  if (current_y > disappear) {
    show = false;
  } else if (current_y > appear) {
    show = true;
  } else {
    show = false;
  }
  return show;
};

var initially_hide = function(x) {
  x.style("visibility", "hidden").style("opacity", 0);
};

var show_obj = function(x, opacity = 1, duration = 300) {
  x.style("visibility", "visible");
  x.transition().duration(duration).style("opacity", opacity);
};

var hide_obj = function(x, duration = 300) {
  x.transition().duration(duration).style("opacity", 0);
  x.transition().delay(duration).style("visibility", "hidden");
};

var show_div = function(id, current_y, appear) {
  var div = document.getElementById(id);
  if (current_y > appear) {
    div.style.visibility = "visible";
    div.style.opacity = 1;
  } else {
    div.style.visibility = "hidden";
    div.style.opacity = 0;
  }
};

var make_box_sticky = function(number, current_y, anchor) {
  var box = document.getElementById("scene" + number + "_box");
  var scene_height = document.getElementById("scene" + number).offsetHeight;
  if (current_y > anchor[number + 1] - height) {
    box.style.position = "relative";
    box.style.top = (scene_height - height) + "px";
  } else if (current_y > anchor[number]) {
    box.style.position = "fixed";
    box.style.top = "0px";
  } else {
    box.style.position = "";
    box.style.top = "";
  }  
};

var define_title = function(title, loc, text_align = "left", height_pc = 0.2) {
  var obj = svg.append("g");
  obj
    .append("foreignObject")
    .attr("x", calc_x(loc[0]))
    .attr("y", calc_y(loc[1]))
    .attr("width", width - story_width)
    .attr("height", height * height_pc)
    .append("xhtml:div")
    .html(title)
    .style("font-family", '"Trebuchet MS", Helvetica, sans-serif')
    .style("font-size", "1.5vw")
    .style("text-align", text_align)
    .style("color", "white");
  initially_hide(obj);
  return obj;
};

var ctrl_title = function(obj, current_y, appear, disappear) {
  if (current_y > appear & current_y < disappear) {
    show_obj(obj);
  } else {
    hide_obj(obj);
  }
};

var ctrl_axis = function(obj, current_y, appear, disappear) {
  if (current_y > appear & current_y < disappear) {
    show_obj(obj, 0.4);
  } else {
    hide_obj(obj);
  }
};

var define_axis_line = function(start, end) {
  var obj = svg.append("g")
    .append("line")
    .attr("x1", calc_x(start[0]))
    .attr("y1", calc_y(start[1]))
    .attr("x2", calc_x(end[0]))
    .attr("y2", calc_y(end[1]))
    .attr("stroke", "white");
  initially_hide(obj);
  return obj;
};

var define_axis_anno = function(text, loc, text_anchor, arrow) {
  var obj_w = width * 0.1; var obj_h = height * 0.1;
  var obj_x = calc_x(loc[0]); var obj_y = calc_y(loc[1]);
  if (text_anchor[0] === "bottom") {
    obj_y = calc_y(loc[1]) - obj_h;
  } else if (text_anchor[0] === "middle") {
    obj_y = calc_y(loc[1]) - obj_h / 2;
  }
  if (text_anchor[1] === "right") {
    obj_x = calc_x(loc[0]) - obj_w;
  } else if (text_anchor[1] === "center") {
    obj_x = calc_x(loc[0]) - obj_w / 2;
  } 
  var obj = svg.append("g");
  initially_hide(obj);
  obj
    .append("foreignObject")
    .attr("width", obj_w)
    .attr("height", obj_h)
    .attr("x", obj_x)
    .attr("y", obj_y)
    .append("xhtml:div")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "table")
    .html(
      "<div style='display: table-cell; padding: 10px 10px 10px 10px; vertical-align:" + 
      text_anchor[0] + "; text-align: " + text_anchor[1] + ";'>" + 
      text + "</div>"
    )
    .style("font-family", '"Trebuchet MS", Helvetica, sans-serif')
    .style("font-size", "1vw")
    .style("color", "white");
  
  var arrow_size_unit = 0.01 * width;
  var arrow_w = 0; var arrow_h = 0;
  var arrow_x = 0; var arrow_y = 0; var arrow_xl = 0; var arrow_xr = 0;
  if (arrow === "up") {
    arrow_w = arrow_size_unit * 1; arrow_h = arrow_size_unit * 4;
    arrow_x = obj_x + obj_w / 2 - arrow_w / 2;
    arrow_y = obj_y - arrow_h;
  } else if (arrow === "down") {
    arrow_w = arrow_size_unit * 1; arrow_h = arrow_size_unit * 4;
    arrow_x = obj_x + obj_w / 2 - arrow_w / 2;
    arrow_y = obj_y + obj_h;
  } else if (arrow === "left") {
    arrow_w = arrow_size_unit * 4; arrow_h = arrow_size_unit * 1;
    arrow_x = obj_x - arrow_w;
    arrow_y = (text_anchor[0] === "top") ? obj_y + arrow_h : obj_y + obj_h - 2 * arrow_h;
  } else if (arrow === "right") {
    arrow_w = arrow_size_unit * 4; arrow_h = arrow_size_unit * 1;
    arrow_x = obj_x + obj_w;
    arrow_y = (text_anchor[0] === "top") ? obj_y + arrow_h : obj_y + obj_h - 2 * arrow_h;
  } else if (arrow === "leftright") {
    arrow_w = arrow_size_unit * 4; arrow_h = arrow_size_unit * 1;
    arrow_xl = obj_x - arrow_w; arrow_xr = obj_x + obj_w;
    arrow_y = (text_anchor[0] === "top") ? obj_y + arrow_h : obj_y + obj_h - 2 * arrow_h;
  }
  if (arrow === "leftright") {
    obj
      .append("image")
      .attr('x', arrow_xl)
      .attr('y', arrow_y)
      .attr('width', arrow_w)
      .attr('height', arrow_h)
      .attr("xlink:href", "img/arrow_left.png");
    obj
      .append("image")
      .attr('x', arrow_xr)
      .attr('y', arrow_y)
      .attr('width', arrow_w)
      .attr('height', arrow_h)
      .attr("xlink:href", "img/arrow_right.png");
    return obj;
  } else if (arrow === "none") {
    return obj;
  } else {
    obj
      .append("image")
      .attr('x', arrow_x)
      .attr('y', arrow_y)
      .attr('width', arrow_w)
      .attr('height', arrow_h)
      .attr("xlink:href", "img/arrow_" + arrow + ".png");
    return obj;
  }
};


var highlight_ab = function(ab, scene, offset = null) {
  var obj = svg.append("g");
  var scene_id = "s" + scene;
  var origin = [0, 0];
  if (data.ab_loc[scene_id][ab].x == null) {
    origin = [(width - Number(data.ab_loc[scene_id][ab].x_diff) / 100 * height) / width * 100, 
              Number(data.ab_loc[scene_id][ab].y)];
  } else {
    origin = [Number(data.ab_loc[scene_id][ab].x), 
              Number(data.ab_loc[scene_id][ab].y)];
  }
  if (offset === null) {
    var destin = origin;
  } else {
    var destin = [origin[0] + offset[0], origin[1] + offset[1]];
    var y_diff = Math.abs(calc_y(origin[1]) - calc_y(destin[1]));
    var x_dir = (origin[0] > destin[0]) ? -1 : 1;
    obj
      .append("circle")
      .attr("cx", calc_x(origin[0]))
      .attr("cy", calc_y(origin[1]))
      .attr("r", 2)
      .attr("fill", "white");
    obj
      .append("path")
      .attr("d", 
            "M " +  calc_x(origin[0]) + " " + calc_y(origin[1]) + 
            " L " + (calc_x(origin[0]) + x_dir * y_diff) + " " + calc_y(destin[1]) + 
            " L " + calc_x(destin[0]) + " " + calc_y(destin[1]))
      .attr("fill", "none")
      .attr("stroke", "white");
  }
  obj
    .append("image")
    .attr("x", calc_x(destin[0]) - 0.02 * width / 2)
    .attr("y", calc_y(destin[1]) - 0.025 * width / 2)
    .attr("width", 0.02 * width)
    .attr("height", 0.025 * width)
    .attr("xlink:href", "img/" + ab + "_marker.png");  
  initially_hide(obj);
  return obj;
};

var ctrl_ab = function(obj, current_y, appear, disappear) {
  if (current_y > appear & current_y < disappear) {
    obj[0].style("visibility", "visible");
    obj[0].transition().delay(200).duration(500).style("opacity", 1);
    obj[1].style("visibility", "visible");
    obj[1].transition().delay(200).duration(500).style("opacity", 1);
  } else {
    hide_obj(obj[0]);
    hide_obj(obj[1]);
  }
};

var define_tooltip = function(obj, obj_opacity_highlight, obj_opacity_normal, col_name = "tooltip") {
  obj
   .on("mouseover", function(d) {	
      d3.select(this).transition().duration(100).style("opacity", obj_opacity_highlight);
      tooltip.html(d[col_name])
        .style("visibility", "visible")
        .style("color", "white")
        .style("background-color", colour_imd_decile(d.imd_decile))
        .style("left", ((d3.event.pageX < width * 0.9) ? d3.event.pageX + 20 : d3.event.pageX - 300) + "px")
        .style("top", ((d3.event.clientY < height * 0.8) ? d3.event.pageY : d3.event.pageY - 100) + "px");
      tooltip.transition().duration(100).style("opacity", 0.9);		
    })
    .on("mouseout", function(d) {
      d3.select(this).transition().duration(100).style("opacity", obj_opacity_normal);
      tooltip.transition().duration(100).style("opacity", 0);
      tooltip.style("visibility", "hidden");
    });  
};

var subtitle = function(x) {
  return "<br><sup style='font-size: 0.9vw; font-style: italic;'>" + x + "</sup>";
};

var define_note = function(source, loc, mouseover = true) {
  var mouseover_text = (mouseover === true) ? "Mouse over to see details" : "";
  var source_text = (source === "") ? "" : "Source: ";
  var header = "";
  if (mouseover_text !== "" & source_text !== "") {
    header = mouseover_text + "; " + source_text
  } else {
    header = mouseover_text + source_text
  }
  var obj = svg.append("g");
  obj
    .append("foreignObject")
    .attr("x", calc_x(loc[0]))
    .attr("y", calc_y(loc[1]))
    .attr("width", 0.3 * width)
    .attr("height", 0.05 * height)
    .append("xhtml:div")
    .html(header + source)
    .style("font-family", '"Trebuchet MS", Helvetica, sans-serif')
    .style("font-size", "0.8vw")
    .style("font-style", "italic")
    .style("color", "white");
  initially_hide(obj);
  return obj;
};

var ctrl_note = function(obj, current_y, appear, disappear) {
  if (current_y > appear & current_y < disappear) {
    console.log(current_y + "/" + appear + "/" + disappear)
    show_obj(obj);
  } else {
    hide_obj(obj);
  }
};

var a_href = function(text, link) {
  return "<a href='" + link + "' target='_blank' style='color: white;'>" + text + "</a>";
};

// Local functions -------------------------------------------------------------

var set_map_location = function(d) {
  var coord = "";
  for (i = 0; i < d.x.length; i++) {
    var xy = calc_x(d.x[i]) + "," + calc_y(d.y[i]);
    coord += xy + " ";
  }
  return coord;
};

var define_legend = function() {
  var legend = svg.append("g");
  var legend_key_step = height * 0.01;
  var legend_x = 0.8;
  for (i = 0; i < 10; i++) {
    legend
      .append("rect")
      .attr("x", width * legend_x)
      .attr("y", height * 0.15 + legend_key_step * i)
      .attr("width", width * 0.01)
      .attr("height", legend_key_step)
      .attr("fill", colour_imd_decile(10 - i));
  }
  legend
    .append("text")
    .attr("x", width * (legend_x + 0.015))
    .attr("y", height * 0.15 + legend_key_step * 0.8)
    .attr("text-anchor", "start")
    .attr("font-size", "0.7vw")
    .attr("fill", "white")
    .text("Least deprived");
  legend
    .append("text")
    .attr("x", width * (legend_x + 0.015))
    .attr("y", height * 0.15 + legend_key_step * 9.8)
    .attr("text-anchor", "start")
    .attr("font-size", "0.7vw")
    .attr("fill", "white")
    .text("Most deprived");
  return legend;
};

var set_hex_location1 = function(d, x_or_y, progress) {
  var i; var coord = ""; var x = 0; var y = 0;
  for (i = 0; i < 6; i++) {
    var x_from = d.hexmap.x[i];
    var x_to = d.hexscatter.x[i];
    var y_from = d.hexmap.y[i];
    var y_to = d.hexscatter.y[i];
    if (x_or_y == "x") {
      x = x_from + (x_to - x_from) * progress;
      y = d.hexmap.y[i];
    } else if (x_or_y == "y") {
      x = d.hexscatter.x[i];
      y = y_from + (y_to - y_from) * progress;
    } else {
      x = x_from + (x_to - x_from) * progress;
      y = y_from + (y_to - y_from) * progress;
    }
    var xy = calc_x(x) + "," + calc_y(y);
    coord += xy + " ";
  }
  return coord;
};

var set_hex_location2 = function(d, progress) {
  var i; var coord = ""; var x = 0; var y = 0;
  for (i = 0; i < 6; i++) {
    var x_from = d.hexscatter.x[i];
    var x_to = d.hex_collapse.x[i];
    var y_from = d.hexscatter.y[i];
    var y_to = d.hex_collapse.y[i];
    x = x_from + (x_to - x_from) * progress;
    y = y_from + (y_to - y_from) * progress;
    var xy = calc_x(x) + "," + calc_y(y);
    coord += xy + " ";
  }
  return coord;
};

var hide_na_hex = function(x) {
  x
    .attr("fill-opacity", function(d) {return (d.hd_mort_na === 1) ? 0 : 1;})
    .attr("stroke-opacity", function(d) {return (d.hd_mort_na === 1) ? 0 : 1;});
};

var define_half_rect = function() {
  var obj = svg.append("g")
    .selectAll("rect").data(data.decile).enter()
    .append("rect")
    .attr("y", function(d) {return calc_y(d.decile_bar_y);})
    .attr("width", function(d) {return calc_w(d.obesity_half_w);})
    .attr("height", function(d) {return calc_h(d.decile_bar_h);})
    .style("fill", function(d) {return colour_imd_decile(d.imd_decile);});
  return obj;
};

var calc_dumbbell_x = function(d) {
  if (d.dumbbell_emer_x > d.dumbbell_elec_x) {
    return calc_x(d.dumbbell_elec_x);
  } else {
    return calc_x(d.dumbbell_emer_x);
  }  
};
var calc_dumbbell_w = function(d) {
  if (d.dumbbell_emer_x > d.dumbbell_elec_x) {
    return calc_x(d.dumbbell_emer_x - d.dumbbell_elec_x);
  } else {
    return calc_x(d.dumbbell_elec_x - d.dumbbell_emer_x);
  }
};

var define_circle = function() {
  var obj = svg.append("g")
    .selectAll("circle").data(data.decile).enter().append("circle")
    .attr("cx", story_width)
    .attr("cy", function(d) {return calc_y(d.decile_y);})
    .attr("r", 7)
    .attr("fill", "white");
  return obj;
};

var gp_x_path = function(start = false) {
  var path = ""; var type = ""; var point = ""; var x = "";
  for (i = 0; i < 10; i++) {
    type = (i === 0) ? "M " : "L ";
    x = (start === true) ? round1(story_width) : calc_x(data.gp_x[i]);
    point = type + x + " " + calc_y(data.decile_y[i]);
    path += point + " ";
  }
  return path;
};

var ae_x_path = function(start = false) {
  var path = ""; var type = ""; var point = ""; var x = "";
  for (i = 0; i < 10; i++) {
    type = (i === 0) ? "M " : "L ";
    x = (start === true) ? calc_x(data.gp_x[i]) : calc_x(data.ae_x[i]);
    point = type + x + " " + calc_y(data.decile_y[i]);
    path += point + " ";
  }
  return path;
};


var define_waterfall = function(p1or2) {
  var waterfall = svg.append("g").attr("id", p1or2)
    .selectAll("rect").data(data.model[p1or2])
    .enter().append("rect")
    .attr("x", function(d, i) {return (i / 15 + 0.25) * width;}).attr("width", 1 / 16 * width)
    .attr("y", function(d) {return calc_y(d.start);})
    .attr("height", 0)
    .attr("fill", function(d, i) {
      if (i === 9 & d.h > 0) {
        return colour_imd_decile(1);
      } else if (i === 9 & d.h < 0) {
        return colour_imd_decile(10);
      } else if (d.h > 0) {
        return colour_imd_decile(3);
      } else {
        return colour_imd_decile(7);
      }
    })
    .attr("stroke", function(d, i) {return (i === 9) ? "white" : "none";})
    .attr("stroke-width", 3)
    .attr("stroke-opacity", 0.5);
  define_tooltip(waterfall, 1, 0.7);
  return waterfall;
};

var define_waterfall_axis = function() {
  var waterfall_axis = svg.append("g");
  waterfall_axis.append("line").attr("x1", 0.21 * width).attr("x2", 0.21 * width)
    .attr("y1", calc_y(data.scene9_layout.p1_axis))
    .attr("y2", calc_y(data.scene9_layout.p1_axis))
    .attr("stroke", "white");
  waterfall_axis.append("line").attr("x1", 0.21 * width).attr("x2", 0.21 * width)
    .attr("y1", calc_y(data.scene9_layout.p2_axis))
    .attr("y2", calc_y(data.scene9_layout.p2_axis))
    .attr("stroke", "white");
  return(waterfall_axis);
}

var set_waterfall_attr = function(obj, i_this_turn, progress_this_turn) {
  obj.style("visibility", "visible").style("opacity", opacity);
  obj
    .transition().duration(200)
    .attr("y", function(d, i) {
      var from = calc_y(d.start);
      var to = (d.h > 0) ? calc_y(d.end) : calc_y(d.start);
      if (i > i_this_turn)        {return from;} 
      else if (i === i_this_turn) {return from + (to - from) * progress_this_turn;} 
      else                        {return to;}
    })
    .attr("height", function(d, i) {
      var from = 0;
      var to = Math.abs(d.h) / 100 * height;
      if (i > i_this_turn)        {return from;} 
      else if (i === i_this_turn) {return from + (to - from) * progress_this_turn;} 
      else                        {return to;}
    });
};

var inequality_path = function(item) {
  var path = ""; var type = ""; var point = ""; var y = "";
  for (i = 0; i < 6; i++) {
    type = (i === 0) ? "M " : "L ";
    x = calc_x(data.inequlity_path_x[item][i])
    y = calc_y(data.inequlity_path_y[item][i])
    point = type + x + " " + y;
    path += point + " ";
  }
  return path;
};

var define_inequality_obj = function(item) {
  var obj = svg.append("g");
  var colour = (item === "hd_mort_eng") ? colour_imd_decile(9) : colour_imd_decile(2);
  var obj_circ = obj
    .selectAll("circle")
    .data(data.inequlity[item])
    .enter()
    .append("circle")
    .attr("cx", function(d) {return calc_x(d.x);})
    .attr("cy", function(d) {return calc_y(d.value);})
    .attr("r", 5)
    .attr("fill", colour);
  define_tooltip(obj_circ, 1, 0.7);
  obj
    .append("path")
    .attr("d", inequality_path(item))
    .attr("fill", "none").attr("stroke", colour);
  obj
    .selectAll("text")
    .data(data.inequlity[item])
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-size", "1vw")
    .style("opacity", 0.8)
    .attr("x", function(d) {return calc_x(d.x);})
    .attr("y", calc_y(10))
    .text(function(d) {return d.year;});
  return obj;
};

var define_inequality_hider = function() {
  var inequality_hider_grad = svg.append("defs").append("linearGradient")
    .attr("id", "inequality_grad");
  inequality_hider_grad.append("stop").attr("id", "stop1")
    .attr("offset", "5%").attr("stop-color", "transparent");
  inequality_hider_grad.append("stop").attr("id", "stop2")
    .attr("offset", "15%").attr("stop-color", "black");
  
  var inequality_hider = svg.append("g")
    .append("rect")
    .attr("x", 0)
    .attr("y", height * 0.2)
    .attr("width", width)
    .attr("height", height * 0.8)
    .attr("fill", "url(#inequality_grad)");
    
  inequality_hider.style("visibility", "hidden");
  return inequality_hider;
};