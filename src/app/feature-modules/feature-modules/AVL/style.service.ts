import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import { AVLStyles, GpsMessage } from './AVL.model'
import { Fill, Stroke, Circle, Style, RegularShape } from 'ol/style';

@Injectable()
export class StyleService {
    public stylePoint(gpsMessage: GpsMessage) {
        var stroke = new Stroke({ color: 'black', width: 2 });
        var fill = new Fill({ color: 'red' });
        let style = new Style({
            image: new RegularShape({
                fill: fill,
                stroke: stroke,
                points: 4,
                radius: 10,
                angle: Math.PI / 4,
            }),
        })
        if (gpsMessage.keyOn == false) {
            var stroke = new Stroke({ color: 'black', width: 1 });
            var fill = new Fill({ color: 'red' });
            style = new Style({
                image: new RegularShape({
                    fill: fill,
                    stroke: stroke,
                    points: 4,
                    radius: 12,
                    angle: Math.PI / 4,
                }),
            })
        }
        else {
            //Vehicle is running
            if (!gpsMessage.heading) {
                var stroke = new Stroke({ color: 'black', width: 2 })
                var fill = new Fill({ color: 'blue' });
                style = new Style({
                    image: new RegularShape({
                        fill: fill,
                        stroke: stroke,
                        points: 6,
                        radius: 8,
                    })
                })
                return style
            }
            //Vehicle driving
            var stroke = new Stroke({ color: 'black', width: 2 });
            var fill = new Fill({ color: 'green' });
            style = new Style({
                image: new RegularShape({
                    fill: fill,
                    stroke: stroke,
                    points: 3,
                    radius: 8,
                    angle: gpsMessage.heading / 180 * Math.PI, //Math.PI / 4,
                }),
            })
        }
        return style
    }

    public styleLineString() {
        let style = new Style({
            stroke: new Stroke({ color: "red" })
        })

        return style
    }
}
