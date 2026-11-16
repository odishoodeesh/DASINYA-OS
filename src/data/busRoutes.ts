/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Official Dasinya Private School Bus Routes, Drivers & Verified House Coordinates
 * Parsed from Google_Keep_Document_788e3079.pdf (Pages 1-10)
 */

export interface BusRider {
  label: string;
  matchedStudentIds: string[];
  gradeSectionLabel?: string;
}

export interface BusStop {
  id: string;
  order: number;
  studentNamesLabel: string;
  riders: BusRider[];
  googleMapsUrl: string | null;
  lat: number | null;
  lng: number | null;
  landmarkNote?: string;
}

export interface BusDriverRoute {
  id: string;
  code: string;
  pin: string;
  name: string;
  nameEn: string;
  routeLabel: string;
  routeLabelArKu: string;
  stops: BusStop[];
}

export const SCHOOL_LOCATION = {
  name: 'Dasinya Private School',
  nameKu: 'قوتابخانەیا داسنیا یا تایبەت',
  nameAr: 'مدرسة داسنيا الأهلية',
  lat: 36.8611058,
  lng: 42.9783187,
  googleMapsUrl: 'https://maps.app.goo.gl/h4MtMhy5Y4rCCquX8',
} as const;

export const DUHOK_CENTER = {
  lat: SCHOOL_LOCATION.lat,
  lng: SCHOOL_LOCATION.lng,
} as const;

export const BUS_DRIVER_ROUTES: BusDriverRoute[] = [
  {
    "id": "drv-mohammed-abdulfatah",
    "code": "BUS-01",
    "pin": "123456",
    "name": "محمد عبدالفتاح",
    "nameEn": "Mohammed Abdulfatah",
    "routeLabel": "Route 01 — Masike / Baroshke / New Duhok",
    "routeLabelArKu": "المسار 01 — محمد عبدالفتاح",
    "stops": [
      {
        "id": "s01-01",
        "order": 1,
        "studentNamesLabel": "يوسف علي",
        "riders": [
          {
            "label": "يوسف علي",
            "matchedStudentIds": [
              "DPS-5857663"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/yQo5MG36szwkrdnHA",
        "lat": 36.863257,
        "lng": 42.982825
      },
      {
        "id": "s01-02",
        "order": 2,
        "studentNamesLabel": "ليفيا كاروان • هيفيان كاروان",
        "riders": [
          {
            "label": "ليفيا كاروان",
            "matchedStudentIds": [
              "DPS-5687010"
            ],
            "gradeSectionLabel": "G1B"
          },
          {
            "label": "هيفيان كاروان",
            "matchedStudentIds": [
              "DPS-4303754"
            ],
            "gradeSectionLabel": "G4B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/kY8L3bM6vYgBiJPK8",
        "lat": 36.840126,
        "lng": 43.016567
      },
      {
        "id": "s01-03",
        "order": 3,
        "studentNamesLabel": "ليندا كاوار • اركان كاوار",
        "riders": [
          {
            "label": "ليندا كاوار",
            "matchedStudentIds": [
              "DPS-5127847"
            ],
            "gradeSectionLabel": "G5A"
          },
          {
            "label": "اركان كاوار",
            "matchedStudentIds": [
              "DPS-5127842"
            ],
            "gradeSectionLabel": "G8A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/5w9adFt4qFD8eDeZ6",
        "lat": 36.840129,
        "lng": 43.016277
      },
      {
        "id": "s01-04",
        "order": 4,
        "studentNamesLabel": "نور سلام",
        "riders": [
          {
            "label": "نور سلام",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/sUWpL62RAzD9DN6L9",
        "lat": 36.836374,
        "lng": 43.049268
      },
      {
        "id": "s01-05",
        "order": 5,
        "studentNamesLabel": "لافين ريفينك",
        "riders": [
          {
            "label": "لافين ريفينك",
            "matchedStudentIds": [
              "DPS-5479136"
            ],
            "gradeSectionLabel": "G2C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/7v2ADz1YwXsmENmA6",
        "lat": 36.839585,
        "lng": 43.049353
      },
      {
        "id": "s01-06",
        "order": 6,
        "studentNamesLabel": "داليا رايد",
        "riders": [
          {
            "label": "داليا رايد",
            "matchedStudentIds": [
              "DPS-5020500"
            ],
            "gradeSectionLabel": "G3A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/zvjqvGDzdwdPMy419",
        "lat": 36.835985,
        "lng": 43.062686
      },
      {
        "id": "s01-07",
        "order": 7,
        "studentNamesLabel": "مصطفا رزگار • نيلين رزگار",
        "riders": [
          {
            "label": "مصطفا رزگار",
            "matchedStudentIds": [
              "DPS-5552966"
            ],
            "gradeSectionLabel": "G1B"
          },
          {
            "label": "نيلين رزگار",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/U3kmw62up9Qif8qR7",
        "lat": 36.844184,
        "lng": 43.053828
      },
      {
        "id": "s01-08",
        "order": 8,
        "studentNamesLabel": "لافين كوفان • لاوه ند كوفان",
        "riders": [
          {
            "label": "لافين كوفان",
            "matchedStudentIds": [
              "DPS-5148397"
            ],
            "gradeSectionLabel": "G4B"
          },
          {
            "label": "لاوه ند كوفان",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/SCHyGw9L1KhJ7Wjk6",
        "lat": 36.844046,
        "lng": 43.053697
      },
      {
        "id": "s01-09",
        "order": 9,
        "studentNamesLabel": "سناريا دلشاد",
        "riders": [
          {
            "label": "سناريا دلشاد",
            "matchedStudentIds": [
              "DPS-5552590"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/vwLMLBBBNcrkwyHL7",
        "lat": 36.84412,
        "lng": 43.053425
      },
      {
        "id": "s01-10",
        "order": 10,
        "studentNamesLabel": "شه هرام شه به نده ر (شهرام شبندر)",
        "riders": [
          {
            "label": "شه هرام شه به نده ر (شهرام شبندر)",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/u1g9bvEdwU6KRWq59",
        "lat": 36.844046,
        "lng": 43.053697
      },
      {
        "id": "s01-11",
        "order": 11,
        "studentNamesLabel": "بانه أدريس",
        "riders": [
          {
            "label": "بانه أدريس",
            "matchedStudentIds": [
              "DPS-4652675"
            ],
            "gradeSectionLabel": "G4B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/kU7p46tCTUrmn4iv9",
        "lat": 36.846437,
        "lng": 43.046493
      },
      {
        "id": "s01-12",
        "order": 12,
        "studentNamesLabel": "سوبار أمير",
        "riders": [
          {
            "label": "سوبار أمير",
            "matchedStudentIds": [
              "DPS-5475936"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/mQDAcC2ekKKfEcB48",
        "lat": 36.846479,
        "lng": 43.04554
      },
      {
        "id": "s01-13",
        "order": 13,
        "studentNamesLabel": "جاك رشاد • بيتانوك رشاد",
        "riders": [
          {
            "label": "جاك رشاد",
            "matchedStudentIds": [
              "DPS-4564686"
            ],
            "gradeSectionLabel": "G5A"
          },
          {
            "label": "بيتانوك رشاد",
            "matchedStudentIds": [
              "DPS-4564660"
            ],
            "gradeSectionLabel": "G5A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/bCXpyCLn1tmwXHpw8",
        "lat": 36.847408,
        "lng": 43.044382
      },
      {
        "id": "s01-14",
        "order": 14,
        "studentNamesLabel": "به هيز طاهر",
        "riders": [
          {
            "label": "به هيز طاهر",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/AC7iAspMBs2rx5dk9",
        "lat": 36.84665,
        "lng": 43.042274
      },
      {
        "id": "s01-15",
        "order": 15,
        "studentNamesLabel": "كرستوفر راني",
        "riders": [
          {
            "label": "كرستوفر راني",
            "matchedStudentIds": [
              "DPS-5659350"
            ],
            "gradeSectionLabel": "G2C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/5NQc6S53aK6f3GB28",
        "lat": 36.841081,
        "lng": 43.014854
      }
    ]
  },
  {
    "id": "drv-ismail-omar",
    "code": "BUS-02",
    "pin": "123457",
    "name": "اسماعيل عمر عبدالله",
    "nameEn": "Ismail Omar Abdullah",
    "routeLabel": "Route 02 — Central & East Duhok",
    "routeLabelArKu": "المسار 02 — اسماعيل عمر عبدالله",
    "stops": [
      {
        "id": "s02-01",
        "order": 1,
        "studentNamesLabel": "بارز زيرفان",
        "riders": [
          {
            "label": "بارز زيرفان",
            "matchedStudentIds": [
              "DPS-5659301",
              "DPS-4886544"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/Szk16KFhWNGMtoHM9",
        "lat": 36.857282,
        "lng": 42.975701
      },
      {
        "id": "s02-02",
        "order": 2,
        "studentNamesLabel": "ادم ديار",
        "riders": [
          {
            "label": "ادم ديار",
            "matchedStudentIds": [
              "DPS-4787610"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/DKoMrXDsKhSxSCFK7",
        "lat": 36.855621,
        "lng": 42.973278
      },
      {
        "id": "s02-03",
        "order": 3,
        "studentNamesLabel": "مجيد فتاح مجيد • دافين فتاح مجيد • زانيار فتاح مجيد",
        "riders": [
          {
            "label": "مجيد فتاح مجيد",
            "matchedStudentIds": [
              "DPS-727454"
            ],
            "gradeSectionLabel": "G8A"
          },
          {
            "label": "دافين فتاح مجيد",
            "matchedStudentIds": []
          },
          {
            "label": "زانيار فتاح مجيد",
            "matchedStudentIds": [
              "DPS-3666118"
            ],
            "gradeSectionLabel": "G7A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/Udbcxa4BAPQiYHF78",
        "lat": 36.854969,
        "lng": 42.972353
      },
      {
        "id": "s02-04",
        "order": 4,
        "studentNamesLabel": "جود لاوند",
        "riders": [
          {
            "label": "جود لاوند",
            "matchedStudentIds": [
              "DPS-5701132"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/zihDocH9HczGwBER8",
        "lat": 36.85382,
        "lng": 42.972457
      },
      {
        "id": "s02-05",
        "order": 5,
        "studentNamesLabel": "دلجان اياز عبدالله • دلناز اياز عبدالله",
        "riders": [
          {
            "label": "دلجان اياز عبدالله",
            "matchedStudentIds": [
              "DPS-4355687"
            ],
            "gradeSectionLabel": "G5B"
          },
          {
            "label": "دلناز اياز عبدالله",
            "matchedStudentIds": [
              "DPS-5530815"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/cbiYU2GVfhaUFbgc7",
        "lat": 36.854487,
        "lng": 42.971095
      },
      {
        "id": "s02-06",
        "order": 6,
        "studentNamesLabel": "الند ماجد",
        "riders": [
          {
            "label": "الند ماجد",
            "matchedStudentIds": [
              "DPS-4899403"
            ],
            "gradeSectionLabel": "G3A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/c6AP1XVrhDLGYopM7",
        "lat": 36.853885,
        "lng": 42.957692
      },
      {
        "id": "s02-07",
        "order": 7,
        "studentNamesLabel": "ايان سامان رشيد",
        "riders": [
          {
            "label": "ايان سامان رشيد",
            "matchedStudentIds": [
              "DPS-5654417"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/EQCs95uBtwj2wMB67",
        "lat": 36.854419,
        "lng": 42.954764
      },
      {
        "id": "s02-08",
        "order": 8,
        "studentNamesLabel": "اليف لزگین كريم • دنيز لزگین كريم",
        "riders": [
          {
            "label": "اليف لزگین كريم",
            "matchedStudentIds": [
              "DPS-5653516"
            ],
            "gradeSectionLabel": "G2C"
          },
          {
            "label": "دنيز لزگین كريم",
            "matchedStudentIds": [
              "DPS-4919853"
            ],
            "gradeSectionLabel": "G4B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/kTfgneWGnyvEW4KD8",
        "lat": 36.852499,
        "lng": 42.952685
      },
      {
        "id": "s02-09",
        "order": 9,
        "studentNamesLabel": "علي احمد حسين • اريز احمد حسين • الا احمد حسين",
        "riders": [
          {
            "label": "علي احمد حسين",
            "matchedStudentIds": [
              "DPS-4233321"
            ],
            "gradeSectionLabel": "G5A"
          },
          {
            "label": "اريز احمد حسين",
            "matchedStudentIds": []
          },
          {
            "label": "الا احمد حسين",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/xQ9VL3ZiVNke1ko88",
        "lat": 36.851549,
        "lng": 42.946234
      },
      {
        "id": "s02-10",
        "order": 10,
        "studentNamesLabel": "طاهر صلاح طاهر",
        "riders": [
          {
            "label": "طاهر صلاح طاهر",
            "matchedStudentIds": [
              "DPS-4294805"
            ],
            "gradeSectionLabel": "G6A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/Qe5MUkbN97zdbKjg8",
        "lat": 36.859864,
        "lng": 42.962874,
        "landmarkNote": "Near DDK Restaurant, Anwar Mayi St, Duhok"
      },
      {
        "id": "s02-11",
        "order": 11,
        "studentNamesLabel": "ته نيا حسن بهجت",
        "riders": [
          {
            "label": "ته نيا حسن بهجت",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/sTwB7PL1sVPFHuZ69",
        "lat": 36.850599,
        "lng": 42.960203
      },
      {
        "id": "s02-12",
        "order": 12,
        "studentNamesLabel": "دليفيا محمد ميهفان رشيد",
        "riders": [
          {
            "label": "دليفيا محمد ميهفان رشيد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/MM5rvmHrKNT4Evv6A",
        "lat": 36.850436,
        "lng": 42.960599
      }
    ]
  },
  {
    "id": "drv-mardan-ali",
    "code": "BUS-03",
    "pin": "123458",
    "name": "مردان علي حصي",
    "nameEn": "Mardan Ali Hasi",
    "routeLabel": "Route 03 — West & North Duhok",
    "routeLabelArKu": "المسار 03 — مردان علي حصي",
    "stops": [
      {
        "id": "s03-01",
        "order": 1,
        "studentNamesLabel": "وهاج احمد عبدالله • زين احمد عبدالله",
        "riders": [
          {
            "label": "وهاج احمد عبدالله",
            "matchedStudentIds": [
              "DPS-4167835"
            ],
            "gradeSectionLabel": "G6A"
          },
          {
            "label": "زين احمد عبدالله",
            "matchedStudentIds": [
              "DPS-4929890"
            ],
            "gradeSectionLabel": "G4A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/ywH3T9bJ9dKmJhjB9",
        "lat": 36.85499,
        "lng": 42.905427
      },
      {
        "id": "s03-02",
        "order": 2,
        "studentNamesLabel": "لاوي هزي عابد",
        "riders": [
          {
            "label": "لاوي هزي عابد",
            "matchedStudentIds": [
              "DPS-5436100"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/DqBUVU1UQqN5YDwEA",
        "lat": 36.857399,
        "lng": 42.903975
      },
      {
        "id": "s03-03",
        "order": 3,
        "studentNamesLabel": "ايزك بشار",
        "riders": [
          {
            "label": "ايزك بشار",
            "matchedStudentIds": [
              "DPS-5889414"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/xdTDcoLy7EncTEWC8",
        "lat": 36.857399,
        "lng": 42.903975
      },
      {
        "id": "s03-04",
        "order": 4,
        "studentNamesLabel": "ساندرا محسن",
        "riders": [
          {
            "label": "ساندرا محسن",
            "matchedStudentIds": [
              "DPS-5538075"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/6REXyn3RZFShug2f7",
        "lat": 36.857399,
        "lng": 42.903975
      },
      {
        "id": "s03-05",
        "order": 5,
        "studentNamesLabel": "امير علي جهور • ايوب علي جهور",
        "riders": [
          {
            "label": "امير علي جهور",
            "matchedStudentIds": [
              "DPS-3910198"
            ],
            "gradeSectionLabel": "G7A"
          },
          {
            "label": "ايوب علي جهور",
            "matchedStudentIds": [
              "DPS-5305151"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/fmMSYwkw1jk85hnj7",
        "lat": 36.857399,
        "lng": 42.903975
      },
      {
        "id": "s03-06",
        "order": 6,
        "studentNamesLabel": "مير چتو محمد",
        "riders": [
          {
            "label": "مير چتو محمد",
            "matchedStudentIds": [
              "DPS-3700962"
            ],
            "gradeSectionLabel": "G7A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/iVZsjEMHnE6zyBnZ6",
        "lat": 36.860721,
        "lng": 42.91251
      },
      {
        "id": "s03-07",
        "order": 7,
        "studentNamesLabel": "ايلين فرهاد لزگین • الند فرهاد لزگین",
        "riders": [
          {
            "label": "ايلين فرهاد لزگین",
            "matchedStudentIds": []
          },
          {
            "label": "الند فرهاد لزگین",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/Ngiyu9Jsmbo6Pb926",
        "lat": 36.860645,
        "lng": 42.912059
      },
      {
        "id": "s03-08",
        "order": 8,
        "studentNamesLabel": "لنا اسماعيل صالح",
        "riders": [
          {
            "label": "لنا اسماعيل صالح",
            "matchedStudentIds": [
              "DPS-5362752"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/1n31AVN6Ucp98MBP9",
        "lat": 36.882801,
        "lng": 42.903328
      },
      {
        "id": "s03-09",
        "order": 9,
        "studentNamesLabel": "روهات گوهدار سليمان • ريان گوهدار سليمان",
        "riders": [
          {
            "label": "روهات گوهدار سليمان",
            "matchedStudentIds": [
              "DPS-4770026"
            ],
            "gradeSectionLabel": "G4A"
          },
          {
            "label": "ريان گوهدار سليمان",
            "matchedStudentIds": [
              "DPS-5425732"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/PQVK9xAxswJTNpiz7",
        "lat": 36.882801,
        "lng": 42.903328
      },
      {
        "id": "s03-10",
        "order": 10,
        "studentNamesLabel": "سليم شمال سليمان",
        "riders": [
          {
            "label": "سليم شمال سليمان",
            "matchedStudentIds": [
              "DPS-5857591"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/i164MF5u43eFxy1q7",
        "lat": 36.885059,
        "lng": 42.91102
      },
      {
        "id": "s03-11",
        "order": 11,
        "studentNamesLabel": "لونا ارمان صدقي",
        "riders": [
          {
            "label": "لونا ارمان صدقي",
            "matchedStudentIds": [
              "DPS-5848956"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/qivyurHYwCWH2Sef8",
        "lat": 36.885059,
        "lng": 42.91102
      }
    ]
  },
  {
    "id": "drv-kaifi-abdullah",
    "code": "BUS-04",
    "pin": "123459",
    "name": "كيفي عبدالله محمد",
    "nameEn": "Kaifi Abdullah Mohammed",
    "routeLabel": "Route 04 — Malta / Zirka / West",
    "routeLabelArKu": "المسار 04 — كيفي عبدالله محمد",
    "stops": [
      {
        "id": "s04-01",
        "order": 1,
        "studentNamesLabel": "سيلين كاروان • شاد فريد • انا فريد",
        "riders": [
          {
            "label": "سيلين كاروان",
            "matchedStudentIds": [
              "DPS-4608019"
            ],
            "gradeSectionLabel": "G4B"
          },
          {
            "label": "شاد فريد",
            "matchedStudentIds": [
              "DPS-4537710"
            ],
            "gradeSectionLabel": "G4B"
          },
          {
            "label": "انا فريد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/sQWCuhhPBpb5ztKt5",
        "lat": 36.864676,
        "lng": 42.958512
      },
      {
        "id": "s04-02",
        "order": 2,
        "studentNamesLabel": "عبدالله زيد • ملك يقضان",
        "riders": [
          {
            "label": "عبدالله زيد",
            "matchedStudentIds": [
              "DPS-3655806"
            ],
            "gradeSectionLabel": "G8A"
          },
          {
            "label": "ملك يقضان",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/AUvW9GjXsbEG4GGt8",
        "lat": 36.864153,
        "lng": 42.958471
      },
      {
        "id": "s04-03",
        "order": 3,
        "studentNamesLabel": "لاوند سامي",
        "riders": [
          {
            "label": "لاوند سامي",
            "matchedStudentIds": [
              "DPS-5583129"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/K1RjF4VcCDegaDvV7",
        "lat": 36.865256,
        "lng": 42.960789
      },
      {
        "id": "s04-04",
        "order": 4,
        "studentNamesLabel": "نازلي بناز",
        "riders": [
          {
            "label": "نازلي بناز",
            "matchedStudentIds": [
              "DPS-5894896"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/hn8Gi9o5qisBgSb59",
        "lat": 36.864865,
        "lng": 42.963261
      },
      {
        "id": "s04-05",
        "order": 5,
        "studentNamesLabel": "لفين فرهاد",
        "riders": [
          {
            "label": "لفين فرهاد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/M7uF74hzJhwcCH6q6",
        "lat": 36.874081,
        "lng": 42.951583
      },
      {
        "id": "s04-06",
        "order": 6,
        "studentNamesLabel": "خندي چلنك • خورت چلنك",
        "riders": [
          {
            "label": "خندي چلنك",
            "matchedStudentIds": []
          },
          {
            "label": "خورت چلنك",
            "matchedStudentIds": [
              "DPS-5851433"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/5ei4TaXt9T3VEA8h8",
        "lat": 36.880671,
        "lng": 42.952688
      },
      {
        "id": "s04-07",
        "order": 7,
        "studentNamesLabel": "زانا وليد",
        "riders": [
          {
            "label": "زانا وليد",
            "matchedStudentIds": [
              "DPS-5472576"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/V9RTLRFwZ5HE1zk7A",
        "lat": 36.878448,
        "lng": 42.949525
      },
      {
        "id": "s04-08",
        "order": 8,
        "studentNamesLabel": "لاوك بلند",
        "riders": [
          {
            "label": "لاوك بلند",
            "matchedStudentIds": [
              "DPS-5455897"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/bHGBwk3YhUkQDcYV9",
        "lat": 36.875153,
        "lng": 42.961769
      },
      {
        "id": "s04-09",
        "order": 9,
        "studentNamesLabel": "ژيان رضوان • هافين رضوان • ارزين رضوان",
        "riders": [
          {
            "label": "ژيان رضوان",
            "matchedStudentIds": []
          },
          {
            "label": "هافين رضوان",
            "matchedStudentIds": []
          },
          {
            "label": "ارزين رضوان",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/8jzbBTeib1zUjVqu7",
        "lat": 36.875153,
        "lng": 42.961769
      },
      {
        "id": "s04-10",
        "order": 10,
        "studentNamesLabel": "شاد شفان • لاوك شفان",
        "riders": [
          {
            "label": "شاد شفان",
            "matchedStudentIds": [
              "DPS-5893826"
            ],
            "gradeSectionLabel": "G4A"
          },
          {
            "label": "لاوك شفان",
            "matchedStudentIds": [
              "DPS-5893823"
            ],
            "gradeSectionLabel": "G3B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/f3N4z5VFL7GeTUdQ8",
        "lat": 36.875153,
        "lng": 42.961769
      },
      {
        "id": "s04-11",
        "order": 11,
        "studentNamesLabel": "عمر هڤال • اياد هڤال",
        "riders": [
          {
            "label": "عمر هڤال",
            "matchedStudentIds": [
              "DPS-4275907"
            ],
            "gradeSectionLabel": "G6A"
          },
          {
            "label": "اياد هڤال",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/zDGufzq8oC3myTJG9",
        "lat": 36.87436,
        "lng": 42.95949
      },
      {
        "id": "s04-12",
        "order": 12,
        "studentNamesLabel": "ياد سكفان • محمد علي",
        "riders": [
          {
            "label": "ياد سكفان",
            "matchedStudentIds": [
              "DPS-4270582"
            ],
            "gradeSectionLabel": "G5B"
          },
          {
            "label": "محمد علي",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/mVxS7tzw2Eac29z99",
        "lat": 36.870344,
        "lng": 42.967659
      },
      {
        "id": "s04-13",
        "order": 13,
        "studentNamesLabel": "ديفيد سمير",
        "riders": [
          {
            "label": "ديفيد سمير",
            "matchedStudentIds": [
              "DPS-4355798"
            ],
            "gradeSectionLabel": "G5B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/2y3yANGCzvaMD5pk9",
        "lat": 36.861062,
        "lng": 42.965937
      }
    ]
  },
  {
    "id": "drv-sarwar-jamal",
    "code": "BUS-05",
    "pin": "123460",
    "name": "سرور جمال حسن",
    "nameEn": "Sarwar Jamal Hassan",
    "routeLabel": "Route 05 — Sarwar Jamal Hassan",
    "routeLabelArKu": "المسار 05 — سرور جمال حسن",
    "stops": [
      {
        "id": "s05-01",
        "order": 1,
        "studentNamesLabel": "الين طارق",
        "riders": [
          {
            "label": "الين طارق",
            "matchedStudentIds": [
              "DPS-5376011"
            ],
            "gradeSectionLabel": "G3A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/BCmSk13P5GgiWbbA7",
        "lat": 36.85689,
        "lng": 42.996164
      },
      {
        "id": "s05-02",
        "order": 2,
        "studentNamesLabel": "بان نزار",
        "riders": [
          {
            "label": "بان نزار",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/SPW9TZWsGkPs6egp6",
        "lat": 36.858446,
        "lng": 43.004182
      },
      {
        "id": "s05-03",
        "order": 3,
        "studentNamesLabel": "بارز نيجيرفان",
        "riders": [
          {
            "label": "بارز نيجيرفان",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/LYRck1a6VFGJCsbAA",
        "lat": 36.858299,
        "lng": 43.008275
      },
      {
        "id": "s05-04",
        "order": 4,
        "studentNamesLabel": "هاژه هاوار",
        "riders": [
          {
            "label": "هاژه هاوار",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/9ZkyCWPV3EShnQbp7",
        "lat": 36.858797,
        "lng": 43.01402
      },
      {
        "id": "s05-05",
        "order": 5,
        "studentNamesLabel": "احمد حازم",
        "riders": [
          {
            "label": "احمد حازم",
            "matchedStudentIds": [
              "DPS-3607737"
            ],
            "gradeSectionLabel": "G7A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/dKZkYiUqsgXp9c5A9",
        "lat": 36.85299,
        "lng": 43.028562
      },
      {
        "id": "s05-06",
        "order": 6,
        "studentNamesLabel": "الان محمد • محمد اسماعيل",
        "riders": [
          {
            "label": "الان محمد",
            "matchedStudentIds": []
          },
          {
            "label": "محمد اسماعيل",
            "matchedStudentIds": [
              "DPS-5304478"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/siHJDszzQdo7AKyu5",
        "lat": 36.851958,
        "lng": 43.039295
      }
    ]
  },
  {
    "id": "drv-abdullah-ahmad",
    "code": "BUS-06",
    "pin": "123461",
    "name": "عبدالله احمد عبدالله",
    "nameEn": "Abdullah Ahmad Abdullah",
    "routeLabel": "Route 06 — Abdullah Ahmad Abdullah",
    "routeLabelArKu": "المسار 06 — عبدالله احمد عبدالله",
    "stops": [
      {
        "id": "s06-01",
        "order": 1,
        "studentNamesLabel": "وسيم",
        "riders": [
          {
            "label": "وسيم",
            "matchedStudentIds": [
              "DPS-5474039"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/cjjqb7FT2v5XsHQU7",
        "lat": 36.851306,
        "lng": 42.982848
      },
      {
        "id": "s06-02",
        "order": 2,
        "studentNamesLabel": "ايان",
        "riders": [
          {
            "label": "ايان",
            "matchedStudentIds": [
              "DPS-5654417"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/NQvRCaH93fAFmGDF9",
        "lat": 36.846834,
        "lng": 42.98686
      },
      {
        "id": "s06-03",
        "order": 3,
        "studentNamesLabel": "محمد",
        "riders": [
          {
            "label": "محمد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": null,
        "lat": null,
        "lng": null
      },
      {
        "id": "s06-04",
        "order": 4,
        "studentNamesLabel": "بروج",
        "riders": [
          {
            "label": "بروج",
            "matchedStudentIds": [
              "DPS-4921955"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/nZZ1hRZ8UK26Fs4q9",
        "lat": 36.842935,
        "lng": 43.003359
      },
      {
        "id": "s06-05",
        "order": 5,
        "studentNamesLabel": "عمر",
        "riders": [
          {
            "label": "عمر",
            "matchedStudentIds": [
              "DPS-4900969",
              "DPS-4275907"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/iVAwiZaihraFSaTs7",
        "lat": 36.843619,
        "lng": 43.009625
      },
      {
        "id": "s06-06",
        "order": 6,
        "studentNamesLabel": "هاري",
        "riders": [
          {
            "label": "هاري",
            "matchedStudentIds": [
              "DPS-4963172"
            ],
            "gradeSectionLabel": "G3A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/KMSNYBPf4PXvZ5ti7",
        "lat": 36.842091,
        "lng": 43.015918
      },
      {
        "id": "s06-07",
        "order": 7,
        "studentNamesLabel": "انا • زكريا",
        "riders": [
          {
            "label": "انا",
            "matchedStudentIds": [
              "DPS-4399014",
              "DPS-3892374"
            ],
            "gradeSectionLabel": "G4B"
          },
          {
            "label": "زكريا",
            "matchedStudentIds": [
              "DPS-4661926"
            ],
            "gradeSectionLabel": "G4B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/kn43mnqjWAP7UquT6",
        "lat": 36.84316,
        "lng": 43.016233
      },
      {
        "id": "s06-08",
        "order": 8,
        "studentNamesLabel": "شوكت",
        "riders": [
          {
            "label": "شوكت",
            "matchedStudentIds": [
              "DPS-5502432"
            ],
            "gradeSectionLabel": "G2C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/ht4ipiM6i8ujAK1s8",
        "lat": 36.84576,
        "lng": 43.014543
      },
      {
        "id": "s06-09",
        "order": 9,
        "studentNamesLabel": "ادم",
        "riders": [
          {
            "label": "ادم",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/xy5ADhFEwq6RbF8G6",
        "lat": 36.844838,
        "lng": 43.010664
      },
      {
        "id": "s06-10",
        "order": 10,
        "studentNamesLabel": "ياد",
        "riders": [
          {
            "label": "ياد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/GV9aD6Wkr4iJ6xrj6",
        "lat": 36.845217,
        "lng": 43.010113
      },
      {
        "id": "s06-11",
        "order": 11,
        "studentNamesLabel": "اتروش",
        "riders": [
          {
            "label": "اتروش",
            "matchedStudentIds": [
              "DPS-5460290"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/cHAu351d7vhowwFk9",
        "lat": 36.844087,
        "lng": 43.00698
      },
      {
        "id": "s06-12",
        "order": 12,
        "studentNamesLabel": "ايلين",
        "riders": [
          {
            "label": "ايلين",
            "matchedStudentIds": [
              "DPS-5598224",
              "DPS-4647807"
            ],
            "gradeSectionLabel": "G2C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/bYwHBXJ7aUVraTL89",
        "lat": 36.843851,
        "lng": 42.994293
      },
      {
        "id": "s06-13",
        "order": 13,
        "studentNamesLabel": "مرام",
        "riders": [
          {
            "label": "مرام",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/uCTdK4LULkDvrQ91A",
        "lat": 36.843985,
        "lng": 42.985838
      },
      {
        "id": "s06-14",
        "order": 14,
        "studentNamesLabel": "شايا • شيلا",
        "riders": [
          {
            "label": "شايا",
            "matchedStudentIds": [
              "DPS-4537705"
            ],
            "gradeSectionLabel": "G4A"
          },
          {
            "label": "شيلا",
            "matchedStudentIds": [
              "DPS-5041430"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/o2PDLppQ3VXFKgFt7",
        "lat": 36.841846,
        "lng": 42.96329
      },
      {
        "id": "s06-15",
        "order": 15,
        "studentNamesLabel": "علي هه يف",
        "riders": [
          {
            "label": "علي هه يف",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/QaDQ1JeRJbj8XHt77",
        "lat": 36.842088,
        "lng": 42.961383
      }
    ]
  },
  {
    "id": "drv-abdulqadir-rashid",
    "code": "BUS-07",
    "pin": "123462",
    "name": "عبدالقادر رشيد سعدي",
    "nameEn": "Abdulqadir Rashid Saadi",
    "routeLabel": "Route 07 — Abdulqadir Rashid Saadi",
    "routeLabelArKu": "المسار 07 — عبدالقادر رشيد سعدي",
    "stops": [
      {
        "id": "s07-01",
        "order": 1,
        "studentNamesLabel": "يحيى فاخر",
        "riders": [
          {
            "label": "يحيى فاخر",
            "matchedStudentIds": [
              "DPS-5433079"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/Ag7YdF9rmGWGSV6A6",
        "lat": 36.870223,
        "lng": 42.933702
      },
      {
        "id": "s07-02",
        "order": 2,
        "studentNamesLabel": "ديفد فهد",
        "riders": [
          {
            "label": "ديفد فهد",
            "matchedStudentIds": [
              "DPS-5889399"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/fP6Lu2E2sGXQgdxG6",
        "lat": 36.873347,
        "lng": 42.938315
      },
      {
        "id": "s07-03",
        "order": 3,
        "studentNamesLabel": "حسين لشگر • سيلا لشگر • ايلا لشكر • ميلا لشكر",
        "riders": [
          {
            "label": "حسين لشگر",
            "matchedStudentIds": [
              "DPS-5479319"
            ],
            "gradeSectionLabel": "G4B"
          },
          {
            "label": "سيلا لشگر",
            "matchedStudentIds": [
              "DPS-3655557"
            ],
            "gradeSectionLabel": "G7A"
          },
          {
            "label": "ايلا لشكر",
            "matchedStudentIds": []
          },
          {
            "label": "ميلا لشكر",
            "matchedStudentIds": [
              "DPS-5479322"
            ],
            "gradeSectionLabel": "G5B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/sNS5SjXSCT7Wjdw66",
        "lat": 36.872646,
        "lng": 42.939304
      },
      {
        "id": "s07-04",
        "order": 4,
        "studentNamesLabel": "ارجان زياد",
        "riders": [
          {
            "label": "ارجان زياد",
            "matchedStudentIds": [
              "DPS-4907069"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/KkrFoVqj4LiGV3QF8",
        "lat": 36.872025,
        "lng": 42.940189
      },
      {
        "id": "s07-05",
        "order": 5,
        "studentNamesLabel": "اريز بيار",
        "riders": [
          {
            "label": "اريز بيار",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/uuq6pzDstqEfnDo59",
        "lat": 36.874803,
        "lng": 42.938978
      },
      {
        "id": "s07-06",
        "order": 6,
        "studentNamesLabel": "زانا نزار • بيل نزار",
        "riders": [
          {
            "label": "زانا نزار",
            "matchedStudentIds": [
              "DPS-4564370"
            ],
            "gradeSectionLabel": "G4A"
          },
          {
            "label": "بيل نزار",
            "matchedStudentIds": [
              "DPS-4564411"
            ],
            "gradeSectionLabel": "G5A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/ndbpiicnGjCiqSn16",
        "lat": 36.874041,
        "lng": 42.941981
      },
      {
        "id": "s07-07",
        "order": 7,
        "studentNamesLabel": "ديفد فاروش",
        "riders": [
          {
            "label": "ديفد فاروش",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/j1AWh7XWXoXDUzHh8",
        "lat": 36.875972,
        "lng": 42.941923
      },
      {
        "id": "s07-08",
        "order": 8,
        "studentNamesLabel": "لاوي ديار",
        "riders": [
          {
            "label": "لاوي ديار",
            "matchedStudentIds": [
              "DPS-5475720"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/XMqKySAESGtm7ssA8",
        "lat": 36.876133,
        "lng": 42.944009
      },
      {
        "id": "s07-09",
        "order": 9,
        "studentNamesLabel": "كاران كارزان",
        "riders": [
          {
            "label": "كاران كارزان",
            "matchedStudentIds": [
              "DPS-5622741"
            ],
            "gradeSectionLabel": "G1A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/eNtuHN59ke7TSpqo9",
        "lat": 36.876716,
        "lng": 42.947445
      },
      {
        "id": "s07-10",
        "order": 10,
        "studentNamesLabel": "بانا اوميد",
        "riders": [
          {
            "label": "بانا اوميد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/mp6FLh692xRDFnjJ6",
        "lat": 36.877005,
        "lng": 42.946691
      },
      {
        "id": "s07-11",
        "order": 11,
        "studentNamesLabel": "محمد مصطفى",
        "riders": [
          {
            "label": "محمد مصطفى",
            "matchedStudentIds": [
              "DPS-5426447",
              "DPS-4610823"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/yPjgyfyBt6wx2CzT9",
        "lat": 36.876337,
        "lng": 42.946077
      },
      {
        "id": "s07-12",
        "order": 12,
        "studentNamesLabel": "جودي عمر",
        "riders": [
          {
            "label": "جودي عمر",
            "matchedStudentIds": [
              "DPS-5501794"
            ],
            "gradeSectionLabel": "G2B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/DYZUvnDVCqaKafan9",
        "lat": 36.877705,
        "lng": 42.941903
      },
      {
        "id": "s07-13",
        "order": 13,
        "studentNamesLabel": "شاهي احسان",
        "riders": [
          {
            "label": "شاهي احسان",
            "matchedStudentIds": [
              "DPS-4355904"
            ],
            "gradeSectionLabel": "G5B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/uCG71PTdbKAyBu4V8",
        "lat": 36.885574,
        "lng": 42.918093
      },
      {
        "id": "s07-14",
        "order": 14,
        "studentNamesLabel": "هيوا عبدالرحمن",
        "riders": [
          {
            "label": "هيوا عبدالرحمن",
            "matchedStudentIds": [
              "DPS-5654529"
            ],
            "gradeSectionLabel": "G2C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/aZAAaM7csokSvxf7A",
        "lat": 36.890178,
        "lng": 42.918231
      }
    ]
  },
  {
    "id": "drv-dilgash",
    "code": "BUS-08",
    "pin": "123463",
    "name": "دلگش",
    "nameEn": "Dilgash",
    "routeLabel": "Route 08 — KRO / Mazi / Anwar Mayi",
    "routeLabelArKu": "المسار 08 — دلگش",
    "stops": [
      {
        "id": "s08-01",
        "order": 1,
        "studentNamesLabel": "ادم ديفد",
        "riders": [
          {
            "label": "ادم ديفد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/J9rk88xd9sJ8PeXB9",
        "lat": 36.8606,
        "lng": 42.982097,
        "landmarkNote": "Near Duhok Polytechnic University, Mazi Qr"
      },
      {
        "id": "s08-02",
        "order": 2,
        "studentNamesLabel": "ايلين فرياد",
        "riders": [
          {
            "label": "ايلين فرياد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/7qHCcSu6QpVecpRG8",
        "lat": 36.861632,
        "lng": 42.974353,
        "landmarkNote": "Near Callenza24, Anwar Mayi Rd, Duhok"
      },
      {
        "id": "s08-03",
        "order": 3,
        "studentNamesLabel": "يوسف عبدالخالق",
        "riders": [
          {
            "label": "يوسف عبدالخالق",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/6b7Kb7L1rb8VPqy36",
        "lat": 36.862437,
        "lng": 42.972203,
        "landmarkNote": "K.R.O (VX6C+XVG), Duhok"
      },
      {
        "id": "s08-04",
        "order": 4,
        "studentNamesLabel": "بريز اوميد",
        "riders": [
          {
            "label": "بريز اوميد",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/HaJHZSr5YbTrTgEr5",
        "lat": 36.859864,
        "lng": 42.962874,
        "landmarkNote": "Near DDK Restaurant, Anwar Mayi St, Duhok"
      },
      {
        "id": "s08-05",
        "order": 5,
        "studentNamesLabel": "هيفا شيور",
        "riders": [
          {
            "label": "هيفا شيور",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/UuLHFkUrbBWEtufJ8",
        "lat": 36.866609,
        "lng": 42.957079,
        "landmarkNote": "Near Duhok Mall, Qazi Mohammad Rd"
      },
      {
        "id": "s08-06",
        "order": 6,
        "studentNamesLabel": "باران شيرزاد",
        "riders": [
          {
            "label": "باران شيرزاد",
            "matchedStudentIds": [
              "DPS-5434248"
            ],
            "gradeSectionLabel": "G1C"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/BgWMXGVnKf3E6i9f8",
        "lat": 36.870312,
        "lng": 42.967109,
        "landmarkNote": "Near Judi Mosque (VXC8+4RH), Duhok"
      },
      {
        "id": "s08-07",
        "order": 7,
        "studentNamesLabel": "هيوا شيروان",
        "riders": [
          {
            "label": "هيوا شيروان",
            "matchedStudentIds": [
              "DPS-5511735"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/BgWMXGVnKf3E6i9f8",
        "lat": 36.870312,
        "lng": 42.967109,
        "landmarkNote": "Near Judi Mosque (VXC8+4RH), Duhok"
      },
      {
        "id": "s08-08",
        "order": 8,
        "studentNamesLabel": "محمد داوود",
        "riders": [
          {
            "label": "محمد داوود",
            "matchedStudentIds": [
              "DPS-5472575"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/BgWMXGVnKf3E6i9f8",
        "lat": 36.870312,
        "lng": 42.967109,
        "landmarkNote": "Near Judi Mosque (VXC8+4RH), Duhok"
      },
      {
        "id": "s08-09",
        "order": 9,
        "studentNamesLabel": "محمد باوان",
        "riders": [
          {
            "label": "محمد باوان",
            "matchedStudentIds": [
              "DPS-5424807"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/84c8rMX3tegEp9za8",
        "lat": 36.86285,
        "lng": 42.9718,
        "landmarkNote": "Near Grnjin Dental Center, KRO Horses Roundabout, Duhok"
      },
      {
        "id": "s08-10",
        "order": 10,
        "studentNamesLabel": "مير وارڤين",
        "riders": [
          {
            "label": "مير وارڤين",
            "matchedStudentIds": [
              "DPS-5604539"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/84c8rMX3tegEp9za8",
        "lat": 36.86285,
        "lng": 42.9718,
        "landmarkNote": "Near Grnjin Dental Center, KRO Horses Roundabout, Duhok"
      },
      {
        "id": "s08-11",
        "order": 11,
        "studentNamesLabel": "محمد مصطفى",
        "riders": [
          {
            "label": "محمد مصطفى",
            "matchedStudentIds": [
              "DPS-5426447",
              "DPS-4610823"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/84c8rMX3tegEp9za8",
        "lat": 36.86285,
        "lng": 42.9718,
        "landmarkNote": "Near Grnjin Dental Center, KRO Horses Roundabout, Duhok"
      },
      {
        "id": "s08-12",
        "order": 12,
        "studentNamesLabel": "لاوند حكمت",
        "riders": [
          {
            "label": "لاوند حكمت",
            "matchedStudentIds": [
              "DPS-5436100",
              "DPS-901534"
            ],
            "gradeSectionLabel": "G1B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/vKNoo4WZUJHm7TpGA",
        "lat": 36.867238,
        "lng": 42.971672,
        "landmarkNote": "Near Depar Mall, Qazi Mohammad Rd (VX8C+VMV), Duhok"
      },
      {
        "id": "s08-13",
        "order": 13,
        "studentNamesLabel": "ايدن وسيم • ملك وسيم",
        "riders": [
          {
            "label": "ايدن وسيم",
            "matchedStudentIds": [
              "DPS-4111828"
            ],
            "gradeSectionLabel": "G6A"
          },
          {
            "label": "ملك وسيم",
            "matchedStudentIds": [
              "DPS-3676588"
            ],
            "gradeSectionLabel": "G8A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/vKNoo4WZUJHm7TpGA",
        "lat": 36.867238,
        "lng": 42.971672,
        "landmarkNote": "Near Depar Mall, Qazi Mohammad Rd (VX8C+VMV), Duhok"
      }
    ]
  },
  {
    "id": "drv-safeen",
    "code": "BUS-09",
    "pin": "123464",
    "name": "سفين",
    "nameEn": "Safeen",
    "routeLabel": "Route 09 — Safeen",
    "routeLabelArKu": "المسار 09 — سفين",
    "stops": [
      {
        "id": "s09-01",
        "order": 1,
        "studentNamesLabel": "نور زيرك 6a",
        "riders": [
          {
            "label": "نور زيرك 6a",
            "matchedStudentIds": [
              "DPS-4127307"
            ],
            "gradeSectionLabel": "G6A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/7m2Q2oecLBA1yH5v6",
        "lat": 36.8582,
        "lng": 42.94894
      },
      {
        "id": "s09-02",
        "order": 2,
        "studentNamesLabel": "لارين • لانا 7A • شاه • شالين 8A • داريان • سالم چلك • كرستيان 8A",
        "riders": [
          {
            "label": "لارين",
            "matchedStudentIds": [
              "DPS-4619923"
            ],
            "gradeSectionLabel": "G5B"
          },
          {
            "label": "لانا 7A",
            "matchedStudentIds": []
          },
          {
            "label": "شاه",
            "matchedStudentIds": []
          },
          {
            "label": "شالين 8A",
            "matchedStudentIds": [
              "DPS-587533"
            ],
            "gradeSectionLabel": "G8A"
          },
          {
            "label": "داريان",
            "matchedStudentIds": [
              "DPS-5880787"
            ],
            "gradeSectionLabel": "G1A"
          },
          {
            "label": "سالم چلك",
            "matchedStudentIds": []
          },
          {
            "label": "كرستيان 8A",
            "matchedStudentIds": [
              "DPS-3679583"
            ],
            "gradeSectionLabel": "G8A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/FaTNREz4hYSc3BQj9",
        "lat": 36.858368,
        "lng": 42.946884
      },
      {
        "id": "s09-03",
        "order": 3,
        "studentNamesLabel": "ايفا فاضل",
        "riders": [
          {
            "label": "ايفا فاضل",
            "matchedStudentIds": [
              "DPS-5892688"
            ],
            "gradeSectionLabel": "G4B"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/FfcECkiVD8CBiVrt6",
        "lat": 36.857212,
        "lng": 42.94584
      },
      {
        "id": "s09-04",
        "order": 4,
        "studentNamesLabel": "أرجن 2A • تانيا 5A • قيس 7A • ايلا • ايفا بوتان 2A",
        "riders": [
          {
            "label": "أرجن 2A",
            "matchedStudentIds": []
          },
          {
            "label": "تانيا 5A",
            "matchedStudentIds": [
              "DPS-4312375"
            ],
            "gradeSectionLabel": "G5A"
          },
          {
            "label": "قيس 7A",
            "matchedStudentIds": [
              "DPS-3694966"
            ],
            "gradeSectionLabel": "G7A"
          },
          {
            "label": "ايلا",
            "matchedStudentIds": []
          },
          {
            "label": "ايفا بوتان 2A",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/EcZKadmJJf3XsZ4v8",
        "lat": 36.856913,
        "lng": 42.946369
      },
      {
        "id": "s09-05",
        "order": 5,
        "studentNamesLabel": "كريستوفر 2C • بوپەر 6A • ايلاف عمر 2",
        "riders": [
          {
            "label": "كريستوفر 2C",
            "matchedStudentIds": []
          },
          {
            "label": "بوپەر 6A",
            "matchedStudentIds": []
          },
          {
            "label": "ايلاف عمر 2",
            "matchedStudentIds": [
              "DPS-5526405"
            ],
            "gradeSectionLabel": "G2A"
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/b1AJazjBxDaZzcMr5",
        "lat": 36.856107,
        "lng": 42.94612
      },
      {
        "id": "s09-06",
        "order": 6,
        "studentNamesLabel": "ميلا هكار 5A",
        "riders": [
          {
            "label": "ميلا هكار 5A",
            "matchedStudentIds": []
          }
        ],
        "googleMapsUrl": "https://maps.app.goo.gl/VUrR7T3Shfug5Ei46",
        "lat": 36.851427,
        "lng": 42.938695
      }
    ]
  }
];

export function authenticateDriver(identifier: string, pin: string): BusDriverRoute | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPin = pin.trim();
  return (
    BUS_DRIVER_ROUTES.find(
      (d) =>
        d.pin === cleanPin &&
        (d.code.toLowerCase() === cleanId ||
          d.nameEn.toLowerCase() === cleanId ||
          d.name === identifier.trim() ||
          d.id.toLowerCase() === cleanId)
    ) || null
  );
}

function normalizeArKuName(s: string): string {
  return s
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىيئێی]/g, 'ي')
    .replace(/[كک]/g, 'ك')
    .replace(/[هةھە]/g, 'ه')
    .replace(/[ؤوۆ]/g, 'و')
    .replace(/[پب]/g, 'ب')
    .replace(/[چج]/g, 'ج')
    .replace(/[ژز]/g, 'ز')
    .replace(/[گقغ]/g, 'ك')
    .replace(/[ڤف]/g, 'ف')
    .replace(/[ڕر]/g, 'ر')
    .replace(/[ڵل]/g, 'ل')
    .replace(/\b\d+[A-Za-z]?\b/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findBusForStudent(studentId: string, studentName?: string): {
  driver: BusDriverRoute;
  stop: BusStop;
} | null {
  for (const driver of BUS_DRIVER_ROUTES) {
    for (const stop of driver.stops) {
      if (stop.riders.some((r) => r.matchedStudentIds.includes(studentId))) {
        return { driver, stop };
      }
    }
  }
  if (studentName) {
    const tokens = normalizeArKuName(studentName).split(' ').filter(Boolean);
    if (tokens.length >= 2) {
      const firstTwo = `${tokens[0]} ${tokens[1]}`;
      for (const driver of BUS_DRIVER_ROUTES) {
        for (const stop of driver.stops) {
          if (
            stop.riders.some((r) => {
              const rNorm = normalizeArKuName(r.label);
              return rNorm === firstTwo || rNorm.startsWith(firstTwo);
            })
          ) {
            return { driver, stop };
          }
        }
      }
    }
  }
  return null;
}
