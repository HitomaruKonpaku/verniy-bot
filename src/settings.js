module.exports = {
    Global: {
        Timezone: 'Asia/Ho_Chi_Minh',
        TimezoneOffset: 7,
    },
    Discord: {
        ClientID: '422330233035948032',
        InviteLink: 'https://discordapp.com/oauth2/authorize?scope=bot&client_id=422330233035948032',
    },
    Twitter: {
        NewTweet: [
            {
                follows: [
                    // @HitomaruKonpaku
                    '2591243785',
                ],
                channels: [
                    // Hitomaru Nuke Zone > #other
                    '462085619691290624',
                ],
            },
            {
                follows: [
                    // @SpaceX
                    '34743251',
                ],
                channels: [
                    // Hitomaru Nuke Zone > #spacex
                    '462085389327532033',
                ],
            },
            {
                follows: [
                    // @FlatIsNice | Tibi | Tibo442
                    '3383309523',
                ],
                channels: [
                    // Hitomaru Nuke Zone > #flatisnice
                    '462085771872960522',
                ],
            },
            {
                follows: [
                    // @vnkeyfc
                    '588402934',
                ],
                channels: [
                    //
                    '466986657304936458',
                ],
                retweet: true,
            },
            {
                follows: [
                    // @KanColle_STAFF
                    '294025417',
                ],
                channels: [
                    // Hitomaru Nuke Zone > #kancolle_staff
                    '462085551734915074',
                    // VN KC > #dev-tweet
                    '441955702781771806',
                    // Quan nhau cua T > #dev-tweet
                    '451006611360710656',
                ],
            },
            {
                follows: [
                    // @GirlsFrontline
                    '3247835011',
                    // @GirlsFrontlineE
                    '958921874523607040',
                ],
                channels: [
                    // Sad Panda > #gf-tweet
                    '458855845669634049',
                    // lolis > #gf-news-feed
                    '457599318996811776',
                ],
            },
        ],
        NewAva: {
            // @HitomaruKonpaku
            '2591243785': {
                interval: 10,
                channels: [
                    '462085619691290624', // Hitomaru Nuke Zone > other
                ],
            },
            // @KanColle_STAFF
            '294025417': {
                interval: 5,
                channels: [
                    '462085551734915074', // Hitomaru Nuke Zone > kancolle_staff
                    '365111136095305730', // Sad Panda > organization
                    '441955702781771806', // VN KC > dev-tweet
                    '442409008788275200', // VN KC > chat
                    '451006611360710656', // Quan nhau cua T > dev-tweet
                    '368557905718542338', // Dzeso > general
                ],
                channelsAsUser: [
                    '425302689887289344', // KC Discord > kc-only
                    '449024082529353739', // KanColle Wikia > kancolle-chat
                    '165107321561808896', // KanColle Wiki > kancolle
                    '334800225191329792', // KC3 > kancolle
                    '345299518012653570', // lolis > boatsluts-kc
                    '98922706317103104', // Daxyn > kancolle
                ],
            },
            // @GirlsFrontline
            '3247835011': {
                interval: 60,
                channels: [
                    '458855845669634049', // Sad Panda > gf-tweet
                    '457599318996811776', // lolis > gf-news-feed
                ],
            },
            // @GirlsFrontlineE
            '958921874523607040': {
                interval: 60,
                channels: [
                    '458855845669634049', // Sad Panda > gf-tweet
                    '457599318996811776', // lolis > gf-news-feed
                ],
            },
        },
    },
    KanColle: {
        LBAS: 'https://i.imgur.com/pmuBMki.png',
        AirPower: 'https://i.imgur.com/8DcnG08.png',
        Development: 'https://i.imgur.com/ZehPS8X.png',
        Akashi: 'http://akashi-list.me/',
        GunFit: 'https://i.imgur.com/RLiJubo.png',
        EscortMod: 'https://i.imgur.com/f3U41DI.png',
        OverKill: 'https://i.imgur.com/YG0ub7G.png',
        Gun: 'https://i.imgur.com/wGdTdxu.jpg',
    },
    Cron: {
        KanColle: [
            '422709303376609290', // Hitomaru Nuke Zone > bot-verniy
            '442409008788275200', // VN KC > chat
            '376294828608061440', // Quan nhau cua T > kc-viet
            '421681074565939201', // Quan nhau cua T > kc-eng
        ],
    },
}