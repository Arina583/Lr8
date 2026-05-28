import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { RulerControl } from '@2gis/mapgl-ruler';
import { Directions } from '@2gis/mapgl-directions';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson'; 
import geoData from './data/small_data1.json';

export const MAP_CENTER = [35.917421, 56.858745];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: mapgl.Map | undefined = undefined;
        let directions: Directions | undefined = undefined;
        let clusterer: Clusterer | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 20,
                maxPitch: 80,
                trafficControl: 'topRight', // показ пробок
                key: '344ac4b7-57d8-4268-960e-7314bbe710ef',
                // style: 'bc937949-8fdd-4b3e-82c0-53232382369a',
                style: '67093a73-1e1d-4670-b928-88c88ab826c1',
                styleState: {
                   globeEnabled: true, //режим глобуса
                   immersiveRoadsOn: true, //иммерсивные дороги
                },
            });

            map.on('click', (e) => console.log(e));

            const data: FeatureCollection<Geometry, GeoJsonProperties> = geoData as FeatureCollection<Geometry, GeoJsonProperties>;

            const source = new mapgl.GeoJsonSource(map, { 
                data, 
                attributes: { 
                    visible: true,
                }, 
            }); 
            

            const layer = { 
                id: 'dtp-data-layer',
                filter: [ 
                    'all', 
                    [ 
                        'match', 
                        ['sourceAttr', 'visible'], 
                        [true], 
                        true,
                        false,
                    ],
                ], 

                type: 'point', 
                style: { 
                    iconImage: 'shield', 
                    iconWidth: 15,
                    textField: ['get', 'category'],
                    textFont: ['Noto_Sans'],
                    textColor: '#0098ea',
                    textHaloColor: '#fff',
                    textHaloWidth: 1,
                    iconPriority: 100,
                    textPriority: 100,
                },
            };

            const layerOne = {
                id: 'dtp-heatmap-layer',
                filter: [
                    'match',
                    ['sourceAttr', 'visible'],
                    [true],
                    true,
                    false,
                ],
                type: 'heatmap',
                style: {
                color: [
                   'interpolate',
                   ['linear'],
                   ['heatmap-density'],
                   0,
                   'rgba(1, 1, 1, 0)',
                   0.2,
                   'rgba(36, 124, 151, 1)',
                   0.4,
                   'rgba(43, 140, 135, 1)',
                   0.6,
                   'rgba(26, 167, 156, 1)',
                   0.8,
                  'rgba(32, 220, 206, 1)',
                   1,
                  'rgba(122, 228, 217, 1)',
                ],
                radius: 20,
                intensity: 0.8,
                opacity: 0.8,
                downscale: 1,
            },
        };

        map.on('styleload', () => {
                // Добавляем слой неба
    map?.addLayer({
      id: 'sky-background',
      type: 'background',
      paint: {
        'background-color': [
          'case',
          ['!', ['global', 'showSkyColor']],
          '#000000',
          [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, '#ed8728',
            8, '#fbb825',
            12, '#87ceeb',
            16, '#4682b4'
          ]
        ]
      }
    });

            // Затем добавляем остальные слои
            map?.addLayer(layer);
            map?.addLayer(layerOne);
        });




            /**
             * Ruler  plugin
             */

            const rulerControl = new RulerControl(map, { position: 'centerRight' });

            /**
             * Clusterer plugin
             */

            clusterer = new Clusterer(map, {
                radius: 60,
            });

            const markers = [
                { coordinates: [55.27887, 25.21001] },
                { coordinates: [55.30771, 25.20314] },
                { coordinates: [55.35266, 25.24382] },
            ];
            clusterer.load(markers);

            /**
             * Directions plugin
             */

            directions = new Directions(map, {
                directionsApiKey: 'rujany4131', // It's just demo key
            });

            directions.carRoute({
                points: [
                    [55.28273111108218, 25.234131928828333],
                    [55.35242563034581, 25.23925607042088],
                ],
            });

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl,
            });
        });

        // Destroy the map, if Map component is going to be unmounted
        return () => {
            directions && directions.clear();
            clusterer && clusterer.destroy();
            map && map.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}