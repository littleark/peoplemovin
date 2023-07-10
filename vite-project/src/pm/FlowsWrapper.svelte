<script>
    import { onMount, afterUpdate } from 'svelte';
    import { getMigration, initFlows } from '../lib/data';
    import DataMovin from './DataMovin';
    import DataMovinInteractions from './DataMovinInteractions';

    let flowData;
    let canvas;
    let ux;
    let dot;
    let flowsWithSizes;
    let datamovin;
    export let showContinents;

    const continentColors = {
      'ASIA': '#8dd3c7',
      'AFRICA': '#ffffb3',
      'EUROPE': '#1f78b4',
      'NORTHERN AMERICA': '#fb8072',
      'OCEANIA': '#80b1d3',
      'LATIN AMERICA AND THE CARIBBEAN': '#fdb462',
    };

    const margins = { left: 0, top: 10, right: 0, bottom: 0, padding: { left: 0, right: 0 } };
    function showCountryInfo(country_info, other, animate = false) {
        console.log('showCountryInfo', country_info, other);

    }
    function showFlowInfo(info) {

        const tooltip = {
            // el: $("#tooltip"),
            // from: $("#tooltip #from"),
            // to: $("#tooltip #to"),
            // flow: $("#tooltip #flow"),
            dot: dot,
            current: ""
        }


      if (info.p) {
        /*
        tooltip.el.css({
          left: Math.round(info.p.x) + "px",
          top: Math.round(info.p.y - 60) + "px",
        }).show();
        */
        // console.log('showFlowInfo', info);
        // console.log(dot)
        dot.style.left = Math.round(info.p.x) + "px";
        dot.style.top = Math.round(info.p.y) + "px";
        dot.style.display = 'block';

        /*
        if ((info.i.flow.f + "_" + info.i.flow.t) == tooltip.current) {
          return;
        }

        tooltip.current = info.i.flow.f + "_" + info.i.flow.t;
        tooltip.from.text(info.i.flow.f);
        tooltip.to.text(info.i.flow.t);
        tooltip.flow.text(info.i.flow.q.toLocaleString());
        return;
        */
        /*
        // ATTEMPT TO PAINT HOVERED CURVE
        info.i.ctx = ix_ctx;
        info.i["stroke-width"] = info.i["stroke-width"] > 1 ? info.i["stroke-width"] : 1;
        info.i.color = "180,100%,50%";;
        info.i.color2 = null;
        requestAnimationFrame(function() {
          datamovin.clean(
            ix_ctx,
            {
              transparent: true,
              area: {
                x1: info.b[0].x,
                y1: info.b[0].y,
                x2: info.b[3].x,
                y2: info.b[3].y
              }
            }
          );
          datamovin.drawCurve(info.b[0].x, info.b[0].y, info.b[3].x, info.b[3].y, info.i);
        })
        */

      } else {
        // hideTooltip();
      }


    }

    onMount(async () => {
        flowData = await getMigration(showContinents);
        console.log('FlowsWrapper', flowData);

        datamovin = new DataMovin();
        flowsWithSizes = initFlows(flowData);
        console.log('flowsWithSizes', flowsWithSizes);

        if (datamovin.init(canvas, {
            flows: flowData,
            margins: margins,
            orientation: 'vertical',
            labels: [],
            flowsWithSizes,
            box_w: 0,
        })) {

            const ratio = datamovin.getRatio();

            datamovin.drawSources();
            datamovin.drawDestinations();

            // datamovin.addLegend();

            const vertical = datamovin.getOrientation() == 'vertical';


            var dm_interactions = new DataMovinInteractions();
            dm_interactions.init(datamovin, { canvas: ux });

            dm_interactions.registerMouseEvents({
                'click': showCountryInfo,
                // 'mouseover': showCountryName,
                'mouseoverbezier': showFlowInfo,
                // 'mouseout': hideCountryName,
                // 'document_scrollwheel':hideCountryName,
                // 'processing': handleProcessing
            });
            /*
            if (window.location.hash) {
                var connection = window.location.hash.split("_");
                switch (connection[0]) {
                    case '#f':
                    datamovin.drawOutFlow(connection[1], true);
                    var goToCountry = datamovin.getPointInfo(connection[1], 'src');
                    showCountryInfo(goToCountry, null, true);
                    // Finger.init(false);
                    break;
                    case '#t':
                    datamovin.drawInFlow(connection[1], true);
                    var goToCountry = datamovin.getPointInfo(connection[1], 'dst');
                    showCountryInfo(goToCountry, null, true);
                    // Finger.init(false);
                    break;
                    case '#c':
                    datamovin.drawFlowFromTo(connection[1], connection[2], true);
                    var goToCountry = datamovin.getPointInfo(connection[1], 'src');
                    showCountryInfo(goToCountry, connection[2], true);
                    // Finger.init(false);
                    break;
                    default:
                }
            }
            */
        } else {
        }

    })

    function handleClick(e, direction, flow) {
        console.log('handleClick',direction, flow)
        if(direction === 'src') {
            datamovin.drawOutFlow(flow[direction], e.shiftKey ? false : true);
        } else {
            datamovin.drawInFlow(flow[direction], e.shiftKey ? false : true);
        }

    }

</script>
<main>
    <div id="flows">
        <div id="sources" class="boxes">
            <ul class="src">
            {#each Object.values(flowsWithSizes?.src ?? {}) as flow, i}
                <li on:click={(e) => handleClick(e, 'src', flow)} style="height: {flow.h + 10}px; top: {flow.y - 5}px;">
                    <b style="background:{continentColors[flow.continent]}" />
                    <span>{flow.src}</span>
                </li>
            {/each}
            </ul>
        </div>
        <div id="canvasContainer">
            <canvas bind:this={canvas} width="100%" class="datamovin"></canvas>
            <span bind:this={dot} id="dot"></span>
            <div bind:this={ux} id="ux"></div>
        </div>
        <div id="destinatons" class="boxes">
            <ul class="dst">
            {#each Object.values(flowsWithSizes?.dst ?? {}) as flow, i}
                <li on:click={(e) => handleClick(e, 'dst', flow)} style="height: {flow.h + 10}px; top: {flow.y - 5}px;">
                    <b style="background:{continentColors[flow.continent]}" />
                    <span>{flow.dst}</span>
                </li>
            {/each}
            </ul>
        </div>
    </div>
</main>
<style>
    #flows {
        display: flex;
    }
    #canvasContainer {
        position: relative;
        width: calc(100% - 340px);
    }
    .boxes {
        width: 170px;
    }
    .boxes ul {
        list-style: none;
        margin: 0;
        padding: 0;
        position: relative;

    }
    .boxes ul li {
        display: block;
        position: absolute;
        width: 100%;
        overflow: visible;

        cursor: pointer;
    }
    .boxes ul li b {
        display: inline-block;
        transform: translateY(5px);
        height: calc(100% - 10px);
        width: 20px;
        position: absolute;
    }
    .boxes ul.src li b {
        right: 0;
    }
    .boxes ul li span {
        display: inline-block;
        position: absolute;
        top: 50%;
        font-size: 10px;
        transform: translateY(-50%);
        pointer-events: none;
        width:170px;
        font-family: sans-serif;
    }
    .boxes ul li:hover span {
        color: #ffff00;
        font-weight: bold;
    }
    .boxes ul.src li span {
        padding-right: 30px;
        right: 0;
        text-align: right;
    }
    .boxes ul.dst li span {
        padding-left: 30px;
        text-align: left;
    }
    span#dot {
    	display: none;
    	background: #00F2FF;
    	width:6px;
    	height:6px;
    	position: absolute;
    	-webkit-border-radius: 3px;
    	border-radius: 3px;
    	z-index: 99999;
    	margin-top: -3px;
    	margin-left: -3px;
    }

    div#ux {
    	position: absolute;
    	top:0;
    	left:0;
    	right:0;
    	bottom:0;
    	background: fo;
    	z-index: 999999;
    }
</style>
