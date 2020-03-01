// !preview r2d3 data=jsonlite::read_json("js/data.json"), dependencies="js/setup.js"

var anchor = get_anchors();


// Define objects and controllers ----------------------------------------------

var guide_scroll_down = svg.append("g").style("opacity", 0.3);
guide_scroll_down
  .append("polygon")
  .attr("points", calc_x(43) + "," + calc_y(10) + " " + calc_x(50) + "," + calc_y(8) + " " + calc_x(57) + "," + calc_y(10))
  .attr("fill", "white");
guide_scroll_down
  .append("text")
  .text("Please scroll down")
  .attr("x", calc_x(50))
  .attr("y", calc_y(12))
  .attr("text-anchor", "middle")
  .style("font-size", "1.5vw")
  .style("font-style", "italic")
  .attr("fill", "white");

var uk_map = svg.append("g")
  .selectAll("polygon").data(data.uk_shp).enter()
  .append("polygon")
  .attr("stroke", "grey")
  .attr("fill", "none")
  .attr("points", function(d) {
    return set_map_location(d);
  });
initially_hide(uk_map);

//// Global
var timebar = svg.append("g"); 
timebar
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", 20)
  .attr("width", story_width)
  .attr("fill", "#A11A20");
timebar
  .append("text")
  .attr("x", story_width - 5)
  .attr("y", 15)
  .attr("text-anchor", "end")
  .attr("fill", "white")
  .text(2020);
initially_hide(timebar);
ctrl_timebar = function(current_y, anchor) {
  var year = 2020;
  if (current_y > anchor[8])      {year = 1968;}
  else if (current_y > anchor[7]) {year = 1975;}
  else if (current_y > anchor[6]) {year = 1991;}
  else if (current_y > anchor[4]) {year = 2009;}
  else if (current_y > anchor[3]) {year = 2017;}
  else                            {year = 2020;}
  timebar
    .selectAll("rect")
    .transition()
    .duration(200)
    .attr("width", story_width * calc_timebar_pc(year));
  timebar
    .selectAll("text")
    .transition()
    .duration(200)
    .attr("x", story_width * calc_timebar_pc(year) - 5)
    .text(year);
  
  if (current_y > anchor[9] - height * 0.5)      {hide_obj(timebar);}
  else if (current_y > anchor[1] - height * 0.5) {show_obj(timebar);}
  else                                           {hide_obj(timebar);}
};

//// Scene 1 & 2
var scene1_title = define_title("England<br>by deprivation", 
                                [50, 88]);
var scene2_title1 = define_title("The more deprived area you live in,", 
                                 [60, 85]);
var scene2_title2 = define_title("the higher chance of death from heart disease", 
                                 [60, 82]);

var scene2_axis_line_x = define_axis_line([40, 3], [95, 3]);
var scene2_axis_anno_x1 = define_axis_anno("Most deprived", [45, 3], ["bottom", "left"], 
                                           arrow = "left");
var scene2_axis_anno_x2 = define_axis_anno("Least deprived", [90, 3], ["bottom", "right"], 
                                           arrow = "right");

var scene2_axis_line_y = define_axis_line([40, 3], [40, 95]);
var scene2_axis_anno_y = define_axis_anno("Heart disease<br>death rate", [43.5, 90], ["top", "center"], 
                                           arrow = "up");

var legend = define_legend();
initially_hide(legend);
ctrl_uk_map = function(current_y, appear, disappear) {
  show = define_visibility(current_y, appear, disappear);
  if (show) {
    show_obj(uk_map, opacity = 0.5);
    show_obj(legend);
  } else {
    hide_obj(uk_map);
    hide_obj(legend);
  }
};

var hexagon = svg.append("g")
  .selectAll("polygon").data(data.lad).enter()
  .append("polygon")
  .attr("stroke", "grey")
  .attr("fill", function(d) {return colour_imd_decile(d.imd_decile);})
  .attr("points", function(d) {
    return set_hex_location1(d, "xy", 0);
  })
  .attr("tooltip", function(d) {return d.tooltip1;});
initially_hide(hexagon);

/////
var ab_point = svg.append("g")
  .selectAll("text")
  .data(data.ab_loc)
  .enter()
  .append("text")
  .attr("x", function(d) {return calc_x(d.s1_x);})
  .attr("y", function(d) {return calc_y(d.s1_y);})
  .text(function(d) {return d.point;})
  .attr("text-anchor", "middle")
  .attr("fill", "white");
initially_hide(ab_point);
/////

define_tooltip(hexagon, 0.5, 1);

ctrl_hexagon = function(current_y, appear, move_x, move_y, collapse) {
  if (current_y > collapse) {
    var collapse_progress = calc_progress(current_y - collapse, height * 0.2);
    hide_na_hex(hexagon);
    //hexagon
    //  .transition()
    //  .duration(100)
    //  .attr("points", function(d) {
	  //    return set_hex_location2(d, collapse_progress);
	  //  });
	  if (collapse_progress === 1) {
	    hide_obj(hexagon);
	  }
  } else if (current_y > move_y) {
    show_obj(hexagon);
    hide_na_hex(hexagon);
    hexagon
      .transition()
      .duration(100)
      .attr("points", function(d) {
	      return set_hex_location1(d, "y", calc_progress(current_y - move_y, height * 0.3));
	    })
	    .style("opacity", 0.5);
	  define_tooltip(hexagon, 0.9, 0.5, "tooltip2");
	  hide_obj(ab_point);
  } else if (current_y > move_x) {
    var move_x_progress = calc_progress(current_y - move_x, height * 0.3);
    hide_na_hex(hexagon);
    hexagon
      .transition()
      .duration(100)
      .attr("points", function(d) {
	      return set_hex_location1(d, "x", move_x_progress);
	    })
	    .style("opacity", 0.5);
	  define_tooltip(hexagon, 0.5, 1, "tooltip");
	  ab_point
	    .transition()
	    .duration(200)
	    .style("opacity", 0);
      // TO-DO
      //.attr("x", function(d) {return calc_x(d.s2_x);})
      //.attr("y", function(d) {return calc_y(d.s2_y);})
      //.transition()
	    //.duration(200)
	    //.style("opacity", (move_x_progress > 1) ? 1 : 0);
  } else if (current_y > appear) {
    show_obj(hexagon);
    show_obj(ab_point);
    hexagon
      .attr("points", function(d) {return set_hex_location1(d, "xy", 0);})
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1);
  } else {
    hide_obj(hexagon);
    hide_obj(ab_point);
  }
};

//// Scene 3 & 6

var grad_gp = []; var grad_ae = []; var decile = 0;
for (i = 0; i < 10; i++) {
  decile = i + 1;
  var grad_gp_def = svg.append("defs").append("linearGradient").attr("id", "grad_gp" + decile);
  var grad_ae_def = svg.append("defs").append("linearGradient").attr("id", "grad_ae" + decile);
  
  grad_gp_def.append("stop").attr("id", "stop1").attr("offset", "5%").attr("stop-color", colour_imd_decile(decile));
  grad_gp_def.append("stop").attr("id", "stop2").attr("offset", "10%").attr("stop-color", "black");
  grad_ae_def.append("stop").attr("id", "stop1").attr("offset", "0%").attr("stop-color", colour_imd_decile(decile));
  grad_ae_def.append("stop").attr("id", "stop2").attr("offset", "0%").attr("stop-color", "black");
  
  grad_gp.push(grad_gp_def);
  grad_ae.push(grad_ae_def);
}
ctrl_grad = function(current_y, gp, ae, obesity) {
  for (i = 0; i < 10; i++) {
    if (current_y > obesity) {
      grad_gp[i].select("#stop1").transition().duration(500).attr("offset", "100%");
      grad_gp[i].select("#stop2").transition().duration(500).attr("offset", "100%");
    } else if (current_y > ae) {
      grad_ae[i].select("#stop1").transition().duration(500).attr("offset", round1(data.ae_grad[i]) + "%");
      grad_ae[i].select("#stop2").transition().duration(500).attr("offset", round1(data.ae_grad[i]) + 5 + "%");
      grad_gp[i].select("#stop1").transition().duration(500).attr("offset", round1(data.gp_grad[i]) + "%");
      grad_gp[i].select("#stop2").transition().duration(500).attr("offset", round1(data.gp_grad[i]) + 5 + "%");
    } else if (current_y > gp) {
      grad_gp[i].select("#stop1").transition().duration(500).attr("offset", round1(data.gp_grad[i]) + "%");
      grad_gp[i].select("#stop2").transition().duration(500).attr("offset", round1(data.gp_grad[i]) + 5 + "%");
    } else {
      grad_gp[i].select("#stop1").transition().duration(500).attr("offset", "5%");
      grad_gp[i].select("#stop2").transition().duration(500).attr("offset", "10%");
    }  
  }
};

var decile_rect = svg.append("g")
  .selectAll("rect").data(data.decile).enter()
  .append("rect")
  .attr("x", story_width)
  .attr("y", function(d) {return calc_y(d.decile_bar_y);})
  .attr("width", width - story_width)
  .attr("height", function(d) {return calc_h(d.decile_bar_h);})
  .style("fill", function(d) {return "url(#grad_gp" + d.imd_decile +")";});
initially_hide(decile_rect);
var decile_rect2 = svg.append("g")
  .selectAll("rect").data(data.decile).enter()
  .append("rect")
  .attr("x", story_width + (width - story_width) / 2)
  .attr("y", function(d) {return calc_y(d.decile_bar_y);})
  .attr("width", width - story_width)
  .attr("height", function(d) {return calc_h(d.decile_bar_h);})
  .style("fill", function(d) {return "url(#grad_ae" + d.imd_decile +")";});
initially_hide(decile_rect2);


var scene3_title = define_title("Hospital admissions for heart disease in deprived areas tend to be as emergencies,<br>rather than planned", 
                                [40, 10]);
var scene3_axis_anno_x1 = define_axis_anno("Heart disease admission", [65, 97], ["top", "right"], arrow = "right");
var scene3_axis_anno_x2 = define_axis_anno("Emergency", [data.decile[9].dumbbell_emer_x, data.decile[9].decile_bar_y - 5], 
                                           ["middle", "center"], arrow = "none");
var scene3_axis_anno_x3 = define_axis_anno("Planned",  [data.decile[9].dumbbell_elec_x, data.decile[9].decile_bar_y - 5], 
                                           ["middle", "center"], arrow = "none");
var scene3_axis_anno_y1 = define_axis_anno("Most<br>deprived", [41, data.decile[0].decile_bar_y - 4], ["middle", "left"], arrow = "none");
var scene3_axis_anno_y2 = define_axis_anno("Least<br>deprived",  [41, data.decile[9].decile_bar_y - 4], ["middle", "left"], arrow = "none");

var scene6_title = define_title("Obesity is far more prevalent in deprived areas<br>" + 
                                "and is a risk factor for heart disease", 
                                [40, 10], "left");
var scene6_axis_anno_x = define_axis_anno("Adult<br>obesity", [60, 97], ["top", "right"], arrow = "right");

ctrl_decile_rect = function(current_y, gp, ae, obesity, disappear) {
  if (current_y > disappear) {
    var disappear_progress = calc_progress(current_y - disappear, height * 0.3);
    decile_rect
      .transition()
      .duration(500)
      .ease(d3.easePoly)
      .attr("width", function(d) {return calc_w(d.obesity_w * (1-disappear_progress));});
    hide_obj(decile_rect2);
  } else if (current_y > obesity) {
    decile_rect
      .style("visibility", "visible")
      .transition()
      .duration(300)
      .attr("x", story_width)
      .attr("width", function(d) {return calc_w(d.obesity_w);})
      .style("opacity", 0.7);
    define_tooltip(decile_rect, 1, 0.7, "tooltip_obesity");
    hide_obj(decile_rect2);
  } else if (current_y > ae) {
    decile_rect2.style("visibility", "visible");
    decile_rect2
      .transition()
      .duration(300)
      .attr("x", story_width + (width - story_width) * 0.5)
      .attr("width", width - story_width * 0.5)
      .style("opacity", 0.4);
    decile_rect
      .on("mouseover", function(d) {d3.select(this).style("opacity", 0.4);})
      .on("mouseout", function(d) {d3.select(this).style("opacity", 0.4);})
      .transition()
      .duration(300)
      .attr("x", story_width)
      .attr("width", width - story_width)
      .style("opacity", 0.4);
  } else if (current_y > gp) {
    decile_rect.style("visibility", "visible");
    decile_rect
      .transition()
      .duration(300)
      .attr("x", story_width)
      .attr("width", width - story_width)
      .style("opacity", 0.4);
    hide_obj(decile_rect2);
  } else {
    hide_obj(decile_rect);
    hide_obj(decile_rect2);
  }
};

var dumbbell = svg.append("g");
  
var dumbbell_link = dumbbell.append("g").attr("id", "link")
  .selectAll("rect").data(data.decile).enter().append("rect")
  .attr("x", function(d) {return calc_x(d.dumbbell_elec_x);})
  .attr("width", 0)
  .attr("y", function(d) {return calc_y(d.decile_y) - 5;})
  .attr("height", 10)
  .attr("fill", function(d) {return colour_imd_decile(d.imd_decile);})
  .style("opacity", 1);
define_tooltip(dumbbell_link, 0.7, 1, "tooltip_dumbbell_link");

var dumbbell_emer = dumbbell.append("g").attr("id", "emer")
  .selectAll("polygon").data(data.decile).enter().append("polygon")
  .attr("points", function(d) {
    var x = calc_x(d.dumbbell_emer_x);
    var y = calc_y(d.decile_y);
    var t1 = ""; var t2 = ""; var t3 = "";
    if (d.dumbbell_emer_x > d.dumbbell_elec_x) {
      t1 = (x + 4) + "," + y;
      t2 = (x - 3) + "," + (y + 7);
      t3 = (x - 3) + "," + (y - 7);
    } else {
      t1 = (x - 4) + "," + y;
      t2 = (x + 3) + "," + (y + 7);
      t3 = (x + 3) + "," + (y - 7);
    }
    return t1 + " " + t2  + " " + t3;
  })
  .attr("fill", function(d) {return colour_imd_decile(d.imd_decile);})
  .style("opacity", 0);
define_tooltip(dumbbell_emer, 0.7, 1, "tooltip_dumbbell_emer");

var dumbbell_elec = dumbbell.append("g").attr("id", "elec")
  .selectAll("rect").data(data.decile).enter().append("rect")
  .attr("x", function(d) {return calc_x(d.dumbbell_elec_x) - 3;})
  .attr("y", function(d) {return calc_y(d.decile_y) - 7;})
  .attr("width", 6)
  .attr("height", 14)
  .attr("fill", function(d) {return colour_imd_decile(d.imd_decile);})
  .style("opacity", 0);
define_tooltip(dumbbell_elec, 0.7, 1, "tooltip_dumbbell_elec");

ctrl_dumbbell = function(current_y, appear, disappear) {
  if (current_y > disappear) {
    dumbbell.transition().duration(300).style("opacity", 0).style("visibility", "hidden");
  } else if (current_y > appear) {
    dumbbell.transition().duration(300).style("opacity", 1).style("visibility", "visible");
    dumbbell.select("#elec").selectAll("rect").transition().duration(300)
      .style("opacity", 1);
    dumbbell.select("#link").selectAll("rect").transition().delay(500).duration(500)
      .attr("x", function(d) {return calc_dumbbell_x(d);})
      .attr("width", function(d) {return calc_dumbbell_w(d);});
    dumbbell.select("#emer").selectAll("polygon").transition().delay(900).duration(200)
      .style("opacity", 1);
  } else {
    dumbbell.select("#elec").selectAll("rect").transition().duration(100)
      .style("opacity", 0);
    dumbbell.select("#link").selectAll("rect").transition().duration(100)
      .attr("x", function(d) {return calc_x(d.dumbbell_elec_x);})
      .attr("width", 0);
    dumbbell.select("#emer").selectAll("polygon").transition().duration(100)
      .style("opacity", 0);
    dumbbell.transition().delay(100).style("visibility", "hidden");
  }
};

//// Scene 4
var scene4_title = define_title("Access to primary care tends to be less good in deprived areas,<br>" + 
                                "making preventive care difficult", 
                                [40, 10]);
var scene4_axis_anno_x = define_axis_anno("Access to GP<br><i style='font-size: 0.6vw;'>(GP / 100k patients)</i>", 
                                          [50, 96], ["top", "right"], arrow = "right");

var circle_gp = define_circle();
define_tooltip(circle_gp, 1, 0.6, "tooltip_gp");
initially_hide(circle_gp);
var path_gp = svg.append("g").append("path").attr("d", gp_x_path(start = true))
  .attr("fill", "none").attr("stroke", "white");
initially_hide(path_gp);

ctrl_gp = function(current_y, appear, disappear) {
  if (current_y > disappear) {
    hide_obj(circle_gp);
    hide_obj(path_gp);
  } else if (current_y > appear) {
    circle_gp.style("visibility", "visible");
    circle_gp
      .transition().duration(300)
      .attr("cx", function(d) {return calc_x(d.gp_x)})
      .style("opacity", 0.6);
    path_gp.style("visibility", "visible");
    path_gp
      .transition().duration(300)
      .attr("d", gp_x_path(start = false))
      .style("opacity", 0.6);
  } else {
    circle_gp
      .transition().duration(300)
      .attr("cx", story_width)
      .style("opacity", 0);
    circle_gp.transition().delay(300).style("visibility", "hidden");
    path_gp
      .transition().duration(300)
      .attr("d", gp_x_path(start = true))
      .style("opacity", 0);
    path_gp.transition().delay(300).style("visibility", "hidden");
  }
};

//// Scene 5
var scene5_title = define_title("Lower usage of primary care in deprived areas is often offset<br>" + 
                                "by A&E attendance, hampering continuous/preventive care", 
                                [37, 10], "right");
var scene5_axis_anno_x = define_axis_anno("A&E<br>attendance", 
                                          [80, 96], ["top", "right"], arrow = "right");

var circle_ae = define_circle();
define_tooltip(circle_ae, 1, 0.6, "tooltip_ae");
initially_hide(circle_ae);
var path_ae = svg.append("g").append("path").attr("d", ae_x_path(start = true))
  .attr("fill", "none").attr("stroke", "white").style("stroke-dasharray", "5 5");
initially_hide(path_ae);
ctrl_ae = function(current_y, appear, disappear) {
  if (current_y > disappear) {
    hide_obj(circle_ae);
    hide_obj(path_ae);
  } else if (current_y > appear) {
    circle_ae.style("visibility", "visible");
    circle_ae
      .transition().duration(300)
      .attr("cx", function(d) {return calc_x(d.ae_x)})
      .style("opacity", 0.6);
    path_ae.style("visibility", "visible");
    path_ae
      .transition().duration(300)
      .attr("d", ae_x_path(start = false))
      .style("opacity", 0.6);
  } else {
    circle_ae
      .transition().duration(300)
      .attr("cx", function(d) {return calc_x(d.gp_x)})
      .style("opacity", 0);
    circle_ae.transition().delay(300).style("visibility", "hidden");
    path_ae
      .transition().duration(300)
      .attr("d", ae_x_path(start = true))
      .style("opacity", 0);
    path_ae.transition().delay(300).style("visibility", "hidden");
  }
};

//// Scene 7
var scene7_title1 = define_title("Better education tends to promote better health...", 
                                 [40, 97]);
var scene7_title2 = define_title("...by resources for healthier lifestyle", 
                                 [52, data.scene7_layout.p1_end - 3]);
var scene7_title3 = define_title("...by healthier behaviours", 
                                 [52, data.scene7_layout.p2_end - 3]);
var scene7_title4 = define_title("...by healthier community", 
                                 [52, data.scene7_layout.p3_end - 3]);
var scene7_1_axis_line_x = define_axis_line([50, data.scene7_layout.p1_start], [90, data.scene7_layout.p1_start]);
var scene7_1_axis_line_y = define_axis_line([50, data.scene7_layout.p1_start], [50, data.scene7_layout.p1_end - 5]);
var scene7_2_axis_line_x = define_axis_line([50, data.scene7_layout.p2_start], [90, data.scene7_layout.p2_start]);
var scene7_2_axis_line_y = define_axis_line([50, data.scene7_layout.p2_start], [50, data.scene7_layout.p2_end - 5]);
var scene7_3_axis_line_x = define_axis_line([50, data.scene7_layout.p3_start], [90, data.scene7_layout.p3_start]);
var scene7_3_axis_line_y = define_axis_line([50, data.scene7_layout.p3_start], [50, data.scene7_layout.p3_end - 5]);
var scene7_axis_anno_x = define_axis_anno("Attainment of<br>Level 3 at 19 (%)", [55, 7], ["top", "center"], arrow = "right");
var scene7_1_axis_anno_y = define_axis_anno("Household income",           [45, data.scene7_layout.p1_mid + 3], 
                                            ["top", "center"], arrow = "up");
var scene7_2_axis_anno_y = define_axis_anno("Healthy eating adults",      [45, data.scene7_layout.p2_mid + 3], 
                                            ["top", "center"], arrow = "up");
var scene7_3_axis_anno_y = define_axis_anno("Alcohol-related admissions", [45, data.scene7_layout.p3_mid], 
                                            ["bottom", "center"], arrow = "down");

var circle_edu = svg.append("g").selectAll("circle")
  .data(data.lad2)
  .enter().append("circle")
  .attr("cx", story_width)
  .attr("cy", function(d) {return calc_y(d.y_start);})
  .attr("r", function(d) {return d.pop / 600 * width;})
  .attr("fill", function(d) {return colour_imd_decile(d.imd_decile);})
  .attr("stroke", function(d) {return d.stroke;})
  .attr("stroke-width", "2");
define_tooltip(circle_edu, 1, 0.7);
initially_hide(circle_edu);
ctrl_edu = function(current_y, move_x, move_y, disappear) {
  if (current_y > disappear) {
    var disappear_progress = calc_progress(current_y - disappear, height * 0.2);
    circle_edu
      .transition()
      .duration(200)
      .ease(d3.easeCircle)
      .attr("cx", function(d) {
        var from = calc_x(d.x); var to = calc_x(d.x * 0.5 + 80 + 1);
        return round1(from + (to - from) * disappear_progress);
      });
  } else if (current_y > move_y) {
    show_obj(circle_edu, opacity = 0.7, duration = 0);
    var y_progress = calc_progress(current_y - move_y, height * 0.2);
    circle_edu
      .transition()
      .duration(200)
      .attr("cx", function(d) {return calc_x(d.x);})
      .attr("cy", function(d) {
        var from = calc_y(d.y_start); var to = calc_y(d.y);
        return round1(from + (to - from) * y_progress);
      });
  } else if (current_y > move_x) {
    var x_progress = calc_progress(current_y - move_x, height * 0.2);
    circle_edu.style("visibility", "visible");
    circle_edu
      .transition()
      .duration(200)
      .style("opacity", 0.7)
      .attr("cx", function(d) {
        var from = story_width; var to = calc_x(d.x);
        return round1(from + (to - from) * x_progress);
      })
      .attr("cy", function(d) {return calc_y(d.y_start);});
  } else {
    hide_obj(circle_edu);
    circle_edu.attr("cx", story_width);
  }
};

//// Scene 8
var asthma_circle_grid = svg.append("g");
asthma_circle_grid.selectAll("line").data(data.scene8_radius).enter().append("line")
  .attr("x1", width).attr("y1", 0.5 * height)
  .attr("x2", function(d) {return width - d.x_diff / 100 * height;})
  .attr("y2", function(d) {return calc_y(d.y);})
  .attr("stroke", "white");
asthma_circle_grid.selectAll("text").data(data.scene8_radius).enter().append("text")
  .attr("x", function(d) {return (width - d.x_diff / 100 * height) * 0.99;})
  .attr("y", function(d) {return calc_y(d.y);})
  .text(function(d) {return d.youth_asthma;})
  .attr("text-anchor", "end")
  .style("font-size", "1vw")
  .attr("fill", "white");
asthma_circle_grid.append("circle")
  .attr("cx", width).attr("cy", 0.5 * height)
  .attr("r", data.scene8_inner / 100 * height)
  .attr("fill", "black")
  .attr("stroke", "white");
for (i = 0; i < 4; i++) {
  asthma_circle_grid.append("text")
    .attr("x", width - height * 0.05 * (i * 3 + 1))
    .attr("y", calc_y(51))
    .attr("fill", "white")
    .style("font-size", "1vw")
    .text((5 * (i + 1)) + "%");
}
asthma_circle_grid.selectAll("circle").data(data.scene8_circum).enter().append("circle")
  .attr("cx", width).attr("cy", 0.5 * height)
  .attr("r", function(d) {return d.r / 100 * height;})
  .attr("fill", "none")
  .attr("stroke", "white");
initially_hide(asthma_circle_grid);

var scene8_title = define_title("Childhood asthma is often associated<br>with poor housing condition", 
                                [45, 80]);

var scene8_axis_anno_circ = define_axis_anno("Asthma admissions,<br>under 19&nbsp;", 
                                             [(width - height * 0.6) / width * 100, 35], 
                                             ["middle", "right"], arrow = "none");
scene8_axis_anno_circ
  .append("image")
  .attr('x', width - height * 0.6)
  .attr('y', height * 0.5)
  .attr('width', width * 0.01 * 5)
  .attr('height', width * 0.01 * 20)
  .attr("xlink:href", "img/arrow_rotating.png");

var scene8_axis_anno_r = define_axis_anno("Fuel poverty", [(width - height * 0.43) / width * 100, 60], 
                                          ["middle", "center"], arrow = "none");
scene8_axis_anno_r
  .append("image")
  .attr('x', width - height * 0.5)
  .attr('y', height * 0.42)
  .attr('width', 0.025 * width * 4)
  .attr('height', 0.025 * width * 1)
  .attr("xlink:href", "img/arrow_left.png");

var circle_asthma = svg.append("g").selectAll("circle")
  .data(data.lad3)
  .enter().append("circle")
  .attr("cx", width)
  .attr("cy", 0.5 * height)
  .attr("r", function(d) {return d.pop / 300 * width;})
  .attr("fill", function(d) {return colour_imd_decile(d.imd_decile);});
define_tooltip(circle_asthma, 1, 0.7);
initially_hide(circle_asthma);

ctrl_asthma = function(current_y, appear, disappear) {
  if (current_y > disappear) {
    hide_obj(circle_asthma);
    hide_obj(asthma_circle_grid);
  } else if (current_y > appear) {
    var appear_progress = calc_progress(current_y - appear, height * 0.2);
    show_obj(asthma_circle_grid, opacity = 0.3);
    circle_asthma.style("visibility", "visible");
    circle_asthma
      .transition()
      .duration(200)
      .ease(d3.easeCircle)
      .style("opacity", 0.7)
      .attr("cx", function(d) {return width - d.x_diff / 100 * height;})
      .attr("cy", function(d) {return calc_y(d.y);});
      //.attr("cx", function(d) {
      //  var from = story_width; var to = calc_x(d.x);
      //  return round1(from + (to - from) * x_progress);
      //})
      //.attr("cy", function(d) {return calc_y(d.y_start);});
  } else {
    hide_obj(circle_asthma);
    circle_asthma.attr("cx", width).attr("cy", 0.5 * height);
    hide_obj(asthma_circle_grid);
  }
};

//// Scene 9
var waterfall_axes = define_waterfall_axis();

var scene9_title = define_title(
  "More fundamental determinants<br>" +
  "such as housing and lifestyle<br>" +
  "are critical to understanding<br>" +
  "the difference in<br>" +
  "heart disease death rates<br>" +
  "between Blackpool and Hart,<br>" +
  "says a machine learning model" + 
  subtitle(
    "Normalised <a href='https://shap.readthedocs.io/' target='_blank' style='color: white;'>SHAP</a> values from a " + 
    "<a href='https://en.wikipedia.org/wiki/Artificial_neural_network' target='_blank' style='color: white;'>neural network model</a>"
  ),
  [1, 85], text_align = "left", height_pc = 0.4);

var scene9_axis_anno_x = svg.append("g").selectAll("foreignObject")
  .data(data.scene9_layout.axis_label).enter().append("foreignObject")
  .attr("x", function(d, i) {return (i / 15 + 0.25) * width;})
  .attr("y", calc_y(data.scene9_layout.p1_axis))
  .attr("width", 1 / 16 * width)
  .attr("height", (data.scene9_layout.p1_axis - data.scene9_layout.p2_axis) / 100 * height)
  .append("xhtml:div")
  .style("width", "100%").style("height", "100%").style("display", "table")
  .html(function(d) {
    return "<div style='display: table-cell; padding: 0px 0px 0px 0px; vertical-align: middle; text-align: center;'>" + 
      d.feature + "</div>";
  })
  .style("font-family", '"Trebuchet MS", Helvetica, sans-serif')
  .style("font-size", "0.8vw")
  .style("color", "white");
initially_hide(scene9_axis_anno_x);

waterfall1 = define_waterfall("p1");
waterfall2 = define_waterfall("p2");

var scene9_axis_anno_y1 = define_axis_anno("Higher<br>death rate", [18, 40], ["top", "center"], arrow = "up");
var scene9_axis_anno_y2 = define_axis_anno("Lower<br>death rate", [18, 17], ["bottom", "center"], arrow = "down");

ctrl_waterfall = function(current_y, obj, appear, disappear) {
  if (current_y > disappear) {
    hide_obj(obj);
  } else if (current_y > appear) {
    var progress = calc_progress(current_y - appear, height * 0.5);
    var i_this_turn = Math.floor(progress * 10);
    var progress_this_turn = (progress * 10 - i_this_turn) / 10;
    obj.style("visibility", "visible").style("opacity", 0.7);
    obj
      .transition()
      .duration(200)
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
  } else {
    obj
      .attr("y", function(d) {return calc_y(d.start);})
      .attr("height", 0);
  }
};
ctrl_waterfall_axis = function(current_y, appear, disappear) {
  if (current_y > disappear) {
    hide_obj(waterfall_axes);
    hide_obj(scene9_axis_anno_x);
  } else if (current_y > appear) {
    var progress = calc_progress(current_y - appear, height * 0.5);
    var i_this_turn = Math.floor(progress * 10);
    waterfall_axes
      .style("visibility", "visible").style("opacity", 1)
      .selectAll("line")
      .transition()
      .duration(200)
      .attr("x2", Math.min((i_this_turn + 1) / 15 + 0.25, 0.95) * width);
    scene9_axis_anno_x
      .style("visibility", "visible")
      .transition()
      .duration(200)
      .style("opacity", function(d, i) {
        return (i <= i_this_turn) ? 0.5 : 0;
      });
  } else {
    waterfall_axes
      .selectAll("line")
      .attr("x2", 0.21 * width);
    hide_obj(scene9_axis_anno_x);
  }
};

//// scene 10
var hd_mort_eng = define_inequality_obj("hd_mort_eng");
initially_hide(hd_mort_eng);
var inequality_index = define_inequality_obj("inequality_index");
initially_hide(inequality_index);
var inequality_hider = define_inequality_hider();
var scene10_title1 = define_title("Heart disease deaths have declined in England", [10, 75]);
scene10_title1.selectAll("*").style("color", colour_imd_decile(9)).style("font-weight", "bold");
var scene10_title2 = define_title("But inequality between regions has increased", [60, 75]);
scene10_title2.selectAll("*").style("color", colour_imd_decile(2)).style("font-weight", "bold");
var scene10_axis_line1 = define_axis_line([12, 12], [48, 12])
var scene10_axis_line2 = define_axis_line([62, 12], [98, 12])
var scene10_axis_anno1 = define_axis_anno("National<br>heart disease<br>death rate", [10, 30], ["top", "center"], arrow = "up");
var scene10_axis_anno2 = define_axis_anno("Index of<br>inequality", [60, 30], ["top", "center"], arrow = "up");
ctrl_inequality = function(current_y, appear, disappear) {
  var progress = calc_progress(current_y - appear, height * 0.5);
  if (current_y > disappear) {
    hide_obj(hd_mort_eng); hide_obj(inequality_index);
    inequality_hider.style("visibility", "hidden");
  } else if (current_y > appear) {
    inequality_hider.style("visibility", "visible");
    show_obj(hd_mort_eng, opacity = 0.7, duration = 0);
    show_obj(inequality_index, opacity = 0.7, duration = 0);
    var from = 0; var to = width;
    inequality_hider
      .transition()
      .duration(200)
      .attr("x", from + (to - from) * progress);
  } else {
    hide_obj(hd_mort_eng); hide_obj(inequality_index);
    inequality_hider.style("visibility", "hidden");
  }
};

var scene1_ab = [highlight_ab("a", 1, [15, -10]), highlight_ab("b", 1, [-7, 4])];
var scene2_ab = [highlight_ab("a", 2, [-5, -3]),   highlight_ab("b", 2, [5, 3])];
var scene3_ab = [highlight_ab("a", 3),            highlight_ab("b", 3)];
var scene7_ab = [highlight_ab("a", 7, [4, -3]),   highlight_ab("b", 7, [4, -3])];
var scene8_ab = [highlight_ab("a", 8, [2, -1]),   highlight_ab("b", 8, [-9, -8])];
var scene9_ab = [highlight_ab("a", 9),            highlight_ab("b", 9)];

var notes = {
  s1: define_note(
    a_href("GOV.UK", "https://www.gov.uk/government/statistics/english-indices-of-deprivation-2019") +
    "; Image credit: Parasite", 
    [70, 99]), 
  s2: define_note(
    a_href("NHS", "https://digital.nhs.uk/data-and-information/publications/clinical-indicators/compendium-of-population-health-indicators/compendium-mortality/current/mortality-from-coronary-heart-disease/mortality-from-coronary-heart-disease-directly-standardised-rate-lt75-years-3-year-average-mfp"),
    [80, 99]), 
  s3: define_note(
    a_href("LG Inform", "https://lginform.local.gov.uk/reports/lgastandard?mod-metric=3177&mod-area=E92000001&mod-group=AllRegions_England&mod-type=namedComparisonGroup"),
    [80, 99]), 
  s4: define_note(
    a_href("NHS", "https://digital.nhs.uk/data-and-information/publications/statistical/general-and-personal-medical-services/final-30-september-2019"),
    [80, 99]), 
  s5: define_note(
    a_href("NHS", "https://digital.nhs.uk/data-and-information/find-data-and-publications/supplementary-information/2018-supplementary-information-files/ae-attendances---regional-breakdown"),
    [80, 99]), 
  s6: define_note(
    a_href("PHE", "https://fingertips.phe.org.uk/profile/general-practice/data#page/3/gid/3000010/pat/15/par/E92000001/ati/46/are/E39000026/iid/92588/age/168/sex/4"),
    [80, 99]), 
  s7: define_note(
    a_href("GOV.UK", "https://www.gov.uk/government/publications/education-statistics-by-la-district-and-pupil-disadvantage") + ", " +
    a_href("ONS", "https://www.ons.gov.uk/economy/regionalaccounts/grossdisposablehouseholdincome/datasets/regionalgrossdisposablehouseholdincomegdhibylocalauthorityintheuk") + ", " +
    a_href("LG Inform", "https://lginform.local.gov.uk/reports/lgastandard?mod-metric=3340&mod-area=E06000009&mod-group=AllLaInCountry&mod-type=comparisonGroupType") + ", " +
    a_href("PHE", "https://www.gov.uk/government/publications/education-statistics-by-la-district-and-pupil-disadvantage"),
    [75, 99]), 
  s8: define_note(
    a_href("LG Inform", "https://lginform.local.gov.uk/reports/lgastandard?mod-metric=3340&mod-area=E06000009&mod-group=AllLaInCountry&mod-type=comparisonGroupType") + ", " +
    a_href("PHE", "https://www.gov.uk/government/publications/education-statistics-by-la-district-and-pupil-disadvantage"),
    [80, 99]), 
  s9: define_note(
    "",
    [5, 4]), 
  s10: define_note(
    a_href("PHE", "https://connect.healthdatainsight.org.uk/health_inequalities/dashboard/"),
    [5, 4]), 
  s11: define_note(
    a_href("NHS", "https://digital.nhs.uk/data-and-information/publications/clinical-indicators/compendium-of-population-health-indicators/compendium-mortality/current/years-of-life-lost/years-of-life-lost-due-to-mortality-from-coronary-heart-disease-directly-standardised-rate-1-74-years-3-year-average-mfp") + ", " +
    a_href("Simkiss (2014)", "https://www.sciencedirect.com/science/article/pii/S1751722213002333") + ", " +
    a_href("Marmot (2010)", "http://www.instituteofhealthequity.org/resources-reports/fair-society-healthy-lives-the-marmot-review/fair-society-healthy-lives-full-report-pdf.pdf"),
    [5, 4],
    mouseover = false)
};



// Conduct ---------------------------------------------------------------------

window.onscroll = function() {
  
  var current_y = window.pageYOffset;
  
  hide_obj(guide_scroll_down);
  
  ctrl_timebar(current_y, anchor);
  
  var step = height * 0.1;
  
  // scene 1 & 2
  var a1_common = anchor[1] + step * 5;
  var a1_diff = anchor[1] + step * 10;
  var a1_map = anchor[1] + step * 15;
  var a2_move_x = anchor[2] + step * -3;
  var a2_move_y = anchor[2];
  var a2_move_y_done = anchor[2] + step * 3;
  var a2_end = anchor[3] + step * -2;
  
  ctrl_uk_map(                   current_y, a1_map, a2_move_x);
  ctrl_hexagon(                  current_y, a1_map, a2_move_x, a2_move_y,      a2_end);
  ctrl_title(scene1_title,       current_y, a1_map, a2_move_x);
  ctrl_title(scene2_title1,      current_y,         a2_move_x,                 a2_end);
  ctrl_axis(scene2_axis_line_x,  current_y,         a2_move_x,                 a2_end);
  ctrl_axis(scene2_axis_anno_x1, current_y,         a2_move_x,                 a2_end);
  ctrl_axis(scene2_axis_anno_x2, current_y,         a2_move_x,                 a2_end);
  ctrl_title(scene2_title2,      current_y,                    a2_move_y,      a2_end);
  ctrl_axis(scene2_axis_line_y,  current_y,                    a2_move_y,      a2_end);
  ctrl_axis(scene2_axis_anno_y,  current_y,                    a2_move_y,      a2_end);
  ctrl_ab(scene1_ab,             current_y, a1_map, a2_move_x);
  ctrl_ab(scene2_ab,             current_y,                    a2_move_y_done, a2_end);
  ctrl_note(notes.s1,         current_y, a1_map, a2_move_x);
  ctrl_note(notes.s2,         current_y,                    a2_move_y_done, a2_end);

  

  make_box_sticky(1, current_y, anchor);
  show_div("scene1_common", current_y, a1_common);
  show_div("scene1_diff1", current_y, a1_diff);
  show_div("scene1_diff2", current_y, a1_map);
  
  // scene 3 & 6
  var a3_main = anchor[3] + step * 1;
  var a4_gp = anchor[4];
  var a5_ae = anchor[5];
  var a6_obesity = anchor[6];
  var a7_edu_move_x = anchor[7] - step * 4;
  
  ctrl_decile_rect(              current_y, a3_main + step * -1, a5_ae, a6_obesity, a7_edu_move_x + step * -4);
  ctrl_grad(                     current_y,           a4_gp,     a5_ae, a6_obesity);
  ctrl_axis(scene3_axis_anno_y1, current_y, a3_main,                                a7_edu_move_x + step * -4);
  ctrl_axis(scene3_axis_anno_y2, current_y, a3_main,                                a7_edu_move_x + step * -4);
  ctrl_ab(scene3_ab,             current_y, a3_main,                                a7_edu_move_x + step * -4);
  
  ctrl_dumbbell(                 current_y, a3_main,  a4_gp);
  ctrl_title(scene3_title,       current_y, a3_main,  a4_gp);
  ctrl_axis(scene3_axis_anno_x1, current_y, a3_main,  a4_gp);
  ctrl_axis(scene3_axis_anno_x2, current_y, a3_main,  a4_gp);
  ctrl_axis(scene3_axis_anno_x3, current_y, a3_main,  a4_gp);
  ctrl_note(notes.s3,            current_y, a3_main,  a4_gp);
  
  ctrl_title(scene6_title,       current_y,                             a6_obesity, a7_edu_move_x + step * -4);
  ctrl_axis(scene6_axis_anno_x,  current_y,                             a6_obesity, a7_edu_move_x + step * -4);
  ctrl_note(notes.s6,            current_y,                             a6_obesity, a7_edu_move_x + step * -4);
        
  // scene 4
  ctrl_gp(                      current_y,            a4_gp,            a6_obesity);
  ctrl_title(scene4_title,      current_y,            a4_gp,     a5_ae);
  ctrl_axis(scene4_axis_anno_x, current_y,            a4_gp,            a6_obesity);
  ctrl_note(notes.s4,           current_y,            a4_gp,     a5_ae);

                 
  // scene 5
  ctrl_ae(                      current_y,                       a5_ae, a6_obesity);
  ctrl_title(scene5_title,      current_y,                       a5_ae, a6_obesity);
  ctrl_axis(scene5_axis_anno_x, current_y,                       a5_ae, a6_obesity);
  ctrl_note(notes.s5,           current_y,                       a5_ae, a6_obesity);
  
  // scene 7
  var a7_edu_move_y = anchor[7] - step * 1;
  var a7_edu_end = anchor[8] - step * 4;
  ctrl_edu(                       current_y, a7_edu_move_x, a7_edu_move_y, a7_edu_end)
  ctrl_title(scene7_title1,       current_y, a7_edu_move_x,                a7_edu_end);
  ctrl_title(scene7_title2,       current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_title(scene7_title3,       current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_title(scene7_title4,       current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_axis(scene7_1_axis_line_x, current_y, a7_edu_move_x,                a7_edu_end);
  ctrl_axis(scene7_2_axis_line_x, current_y, a7_edu_move_x,                a7_edu_end);
  ctrl_axis(scene7_3_axis_line_x, current_y, a7_edu_move_x,                a7_edu_end);
  ctrl_axis(scene7_axis_anno_x,   current_y, a7_edu_move_x,                a7_edu_end);
  ctrl_axis(scene7_1_axis_line_y, current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_axis(scene7_2_axis_line_y, current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_axis(scene7_3_axis_line_y, current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_axis(scene7_1_axis_anno_y, current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_axis(scene7_2_axis_anno_y, current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_axis(scene7_3_axis_anno_y, current_y,                a7_edu_move_y, a7_edu_end);
  ctrl_ab(scene7_ab,              current_y, a7_edu_move_x +  + step * 2,  a7_edu_end);
  ctrl_note(notes.s7,             current_y, a7_edu_move_x +  + step * 2,  a7_edu_end);

  // scene 8
  var a8_start = anchor[8];
  var a8_end = anchor[9] + step * -7;
  ctrl_asthma(                     current_y, a8_start, a8_end);
  ctrl_title(scene8_title,         current_y, a8_start, a8_end);
  ctrl_axis(scene8_axis_anno_circ, current_y, a8_start, a8_end);
  ctrl_axis(scene8_axis_anno_r,    current_y, a8_start, a8_end);
  ctrl_ab(scene8_ab,               current_y, a8_start, a8_end);
  ctrl_note(notes.s8,           current_y, a8_start, a8_end);

  // scene 9
  var a9_start =  anchor[9];
  var a9_title =  anchor[9] + step * 6;
  var a10_start = anchor[9] + step * 12;
  var a10_mid =   anchor[9] + step * 16;
  var a11_start = anchor[9] + step * 20;
  var a11_end = anchor[9] +   step * 26;
  ctrl_waterfall(                current_y, waterfall1, a9_start,           a10_start);
  ctrl_waterfall(                current_y, waterfall2, a9_start,           a10_start);
  ctrl_waterfall_axis(           current_y,             a9_start,           a10_start);
  ctrl_title(scene9_title,       current_y,                       a9_title, a10_start);
  ctrl_axis(scene9_axis_anno_y1, current_y,             a9_start,           a10_start);
  ctrl_axis(scene9_axis_anno_y2, current_y,             a9_start,           a10_start);
  ctrl_ab(scene9_ab,             current_y,             a9_start,           a10_start);
  ctrl_note(notes.s9,         current_y,                          a9_title, a10_start);
  make_box_sticky(9, current_y, anchor);

  // scene 10
  ctrl_inequality(              current_y, a10_start,                     a11_start);
  ctrl_title(scene10_title1,    current_y, a10_start + step * 1,          a11_start);
  ctrl_axis(scene10_axis_line1, current_y, a10_start + step * 1,          a11_start);
  ctrl_axis(scene10_axis_anno1, current_y, a10_start + step * 1,          a11_start);
  ctrl_title(scene10_title2,    current_y,                       a10_mid, a11_start);
  ctrl_axis(scene10_axis_line2, current_y,                       a10_mid, a11_start);
  ctrl_axis(scene10_axis_anno2, current_y,                       a10_mid, a11_start);
  ctrl_note(notes.s10,          current_y,                       a10_mid, a11_start);
  show_div("scene9_text2",      current_y, a10_start);
  
  // scene 11
  ctrl_note(notes.s11,          current_y,                                a11_start, a11_end);
  show_div("scene9_text3",      current_y,            a11_start);
  
  // To put story div in front at first and end
  var story_div = document.getElementsByClassName("story");
  if (current_y < anchor[0] | current_y > a11_end) {
    story_div[0].style.zIndex = 20;
  } else {
    story_div[0].style.zIndex = 0;
  }
};

