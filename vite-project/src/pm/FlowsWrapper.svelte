<script>
    import { onMount, afterUpdate } from 'svelte';
    import { getMigration, initFlows, getTopNFlows } from '../lib/data';
    import DataMovin from './DataMovin';
    import DataMovinInteractions from './DataMovinInteractions';

    let flowData;
    let canvas;
    let canvasOver;
    let ux;
    let dot;
    let tooltip = {
        from: '',
        to: '',
        flow: '',
    };
    let tooltipNode;
    let tooltipFrom;
    let tooltipTo;
    let tooltipFlow;
    let tooltipCurrent;
    let flowsWithSizes;
    let datamovin;
    export let showContinents;
    export let preselected = null;
    export let innerWidth;
    export let windowWidth;

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
        // console.log('showCountryInfo', country_info, other);

    }
    function showFlowInfo(info, areas) {
        // console.log(info, areas)
        const tooltip = {
            dot,
            current: ""
        }
      if (info.p) {

        tooltipNode.style.left = Math.round(info.p.x) + "px";
        tooltipNode.style.top = Math.round(info.p.y) + "px";

        if(info.p.x < 100) {
            tooltipNode.style.transform = 'translate(0, -100%)';
        } else if(info.p.x > areas.dst.x1 - 100) {
            tooltipNode.style.transform = 'translate(-100%, -100%)';
        } else {
            tooltipNode.style.transform = 'translate(-50%, -100%)';
        }

        dot.style.left = info.p.x + "px";
        dot.style.top = info.p.y + "px";
        // dot.style.height = Math.max(info.i['stroke-width'], 6) + "px";
        dot.style.display = 'block';


        if ((info.i.flow.f + "_" + info.i.flow.t) === tooltipCurrent) {
          return;
        }

        // console.log('info', info)
        datamovin.drawCurveOver(info.b[0].x, info.b[0].y, info.b[3].x, info.b[3].y, {
            ...info.i,
        });

        tooltipCurrent = info.i.flow.f + "_" + info.i.flow.t;
        tooltipFrom = info.i.flow.f;
        tooltipTo = info.i.flow.t;
        tooltipFlow = info.i.flow.q.toLocaleString();
        tooltipNode.style.display = 'block';
        return;
      } else {
        // hideTooltip();
      }


    }

    afterUpdate(() => {
        if(datamovin) {
            datamovin.update();
        }
	})

    onMount(async () => {
        flowData = await getMigration(showContinents);
        // console.log('FlowsWrapper', flowData);
        const topN = getTopNFlows(flowData, 10);
        console.log('topN', topN);
        datamovin = new DataMovin();
        flowsWithSizes = initFlows(flowData);
        // console.log('flowsWithSizes', flowsWithSizes);

        if (datamovin.init(canvas, {
            flows: flowData,
            margins: margins,
            orientation: 'vertical',
            labels: [],
            flowsWithSizes,
            box_w: 0,
            canvasOver,
        })) {

            const ratio = datamovin.getRatio();

            datamovin.drawSources();
            datamovin.drawDestinations();
            if(preselected?.length) {
                preselected.forEach(d => {
                    datamovin[d.direction === 'from' ? 'drawOutFlow' : 'drawInFlow'](d.country,false)
                })
            }

            // datamovin.addLegend();

            const vertical = datamovin.getOrientation() == 'vertical';


            var dm_interactions = new DataMovinInteractions();
            dm_interactions.init(datamovin, { canvas: ux });

            dm_interactions.registerMouseEvents({
                'click': showCountryInfo,
                // 'mouseover': showCountryName,
                'mouseoverbezier': showFlowInfo,
                'mouseout': handleMouseOut,
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

    // handleMouseOut
    function handleMouseOut(e) {
        datamovin.cleanOver()
        tooltipCurrent = null;
        tooltipNode.style.display = 'none';
        dot.style.display = 'none';
    }

</script>
<main>
    <div class="flows-header">
        <div class="boxes">ORIGINS</div>
        <div class="between"></div>
        <div class="boxes">DESTINATIONS</div>
    </div>
    <div class="flows">
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
            <canvas bind:this={canvasOver} width="100%" class="datamovin canvas-over"></canvas>
            <canvas bind:this={canvas} width="100%" class="datamovin"></canvas>
            <span bind:this={dot} class="dot"></span>
            <div bind:this={tooltipNode} class="tooltip">
                {#if tooltipFrom !== tooltipTo}
                    <span class="tooltip-flow">{tooltipFlow}</span>
                    have moved from <br/>
                    <span>{tooltipFrom}</span>
                    to
                    <span>{tooltipTo}</span>
                {:else}
                    <span class="tooltip-flow">{tooltipFlow}</span>
                    have moved within <span>{tooltipFrom}</span>
                {/if}
            </div>
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
    main {
        margin-top: 50px;
    }
    .flows,
    .flows-header {
        display: flex;
    }
    .between,
    #canvasContainer {
        position: relative;
        width: calc(100% - 340px);
    }
    .canvas-over {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
    }
    .boxes {
        width: 170px;
    }
    .flows-header .boxes:first-child {
        text-align: right;
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

        text-shadow:
            -1px -1px 0 #000,
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000;
    }
    .boxes ul li:hover span {
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
    span.dot {
    	display: none;
    	background: #00F2FF;
    	width:6px;
    	height:6px;
    	position: absolute;
    	border-radius: 3px;
    	z-index: 99999;
        transform: translate(-50%, -50%);
    }
    .tooltip {
       	font-family: 'Open Sans', arial, serif;
        display: none;
       	position: absolute;
       	z-index:99999;

       	top:0;
       	left:0;

       	font-weight: normal;
       	color:#ddd;
       	font-size: 12px;
       	font-style: normal;
       	font-weight: 300;
       	text-transform: uppercase;

        padding: 10px;
       	background: rgba(40,40,40,0.8);

        white-space: nowrap;

        margin-top: -10px;
        transform: translate(-50%, -100%);
    }
    .tooltip span {
       	color: #00F2FF;
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
    @media only screen
    and (min-device-width: 320px)
    and (max-device-width: 480px)
    and (-webkit-min-device-pixel-ratio: 2)
    and (orientation: portrait) {
        #canvasContainer {
            position: relative;
            width: 100%;
        }
        .boxes {
            width: 20px;
            z-index: 9999;
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
            text-align: left;
            font-family: sans-serif;
        }
        .boxes ul li:hover span {
            font-weight: bold;
            font-size: 14px;
        }
        .boxes ul.src li span {
            left: 0px;
            padding-left: 30px;
            text-align: left;
        }
        .boxes ul.dst li span {
            right: 0;
            padding-right: 30px;
            text-align: right;
        }
    }
</style>
