<script>
import { onMount, afterUpdate } from 'svelte';
import * as chrt from 'chrt';

export let data;
export let fields;
let chart;

const formatter = Intl.NumberFormat('en', { notation: 'compact' });

onMount(() => {
    console.log('LINECHART', data, fields);

    chrt.Chrt()
        .size('auto', 250)
        .margins({left:20, right:40, top: 0})
        .padding({left:0, right:0, top: 30})
        .node(chart)
        .x({domain:[1990,2020]})
        .y([0,null])
        .add(
            chrt.yAxis(3)
                .orient('right')
                .labelPosition('inside')
                .color('#ffffff')
                .format(formatter.format)
                .firstLabel(false)
                .lastLabel(false)
                .firstTick(false)
                .hideAxis()
                .hideTicks()
        )
        .add(
            chrt.xAxis(5)
                // .labelPosition('inside')
                .color('#ffffff')
                .hideAxis()
                .hideTicks()
        )
        .add(
            chrt.line()
                .data(data, d => ({
                    x: d[fields[0]],
                    y: d[fields[1]],
                }))
                .area()
                .strokeWidth(0)
                .fill('#ffffff')
                .fillOpacity(0.15)
        )
        .add(
            chrt.horizontalGrid(3)
                .color('#000000')
                .firstTick(false)
        )
        .add(
            chrt.verticalGrid(5)
                .color('#000000')
        )
        .add(
            chrt.line()
                .data(data, d => ({
                    x: d[fields[0]],
                    y: d[fields[1]],
                }))
                .strokeWidth(6)
                .color('#ffffff')
                .add(
                    chrt.markers()
                        .radius(5)
                        .lastMarker()
                )
                .add(
                    chrt.labels()
                        .value(d => formatter.format(d.y))
                        .align('start')
                        .valign('middle')
                        .color('#fff')
                        .offset(10,0)
                        .lastLabel()

                    )
        )
});

</script>
<main>
    <div bind:this={chart} class="chart"/>
</main>
<style>
    .chart {
        font-size: 12px;
    }
</style>
