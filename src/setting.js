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
            // {
            //     follows: [],
            //     channels: [],
            //     retweet: undefined,
            //     media: undefined,
            // },
            {
                follows: [
                    // @HitomaruKonpaku
                    '2591243785',
                ],
                channels: [
                    // Hitomaru Nuke Zone > #other
                    '462085619691290624',
                ],
                media: undefined,
                retweet: undefined,
                reply: undefined,
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
                    // VNKFC > #news-tweet
                    '469009635152494593',
                    // VNKFC > #chat
                    '466986657304936458',
                ],
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
            {
                follows: [
                    // @Battlefield
                    '27855118',
                    // @TheDivisionGame
                    '1499636930',
                ],
                channels: [
                    '499935977041821706',
                    '499936001301544980',
                ],
                reply: false,
            },
        ],
        NewAva: {
            // @HitomaruKonpaku
            '2591243785': {
                interval: 10,
                channels: [
                    // Hitomaru Nuke Zone > #other
                    '462085619691290624',
                ],
            },
            // @KanColle_STAFF
            '294025417': {
                interval: 5,
                channels: [
                    // Hitomaru Nuke Zone > #kancolle_staff
                    '462085551734915074',
                    // Sad Panda > #kancolle
                    '474226940119613440',
                    // VN KC > #dev-tweet
                    '441955702781771806',
                    // VN KC > #chat
                    '442409008788275200',
                    // Quan nhau cua T > #dev-tweet
                    '451006611360710656',
                    // Quan nhau cua T > general-viet
                    '413622936247992339',
                    // Quan nhau cua T > general-international
                    '467951157440937985',
                    // Dzeso > #general
                    '368557905718542338',
                ],
                channelsAsUser: [
                    // KC Discord > #kc-only
                    '425302689887289344',
                    // KanColle Wiki > #kancolle
                    '165107321561808896',
                    // KC3 > #kancolle
                    '334800225191329792',
                    // lolis > #boatsluts-kc
                    '345299518012653570',
                    // Daxyn > #kancolle
                    '98922706317103104',
                ],
            },
            // @GirlsFrontline
            '3247835011': {
                interval: 60,
                channels: [
                    // Sad Panda > #gf-tweet
                    '458855845669634049',
                    // lolis > #gf-news-feed
                    '457599318996811776',
                ],
            },
            // @GirlsFrontlineE
            '958921874523607040': {
                interval: 60,
                channels: [
                    // Sad Panda > #gf-tweet
                    '458855845669634049',
                    // lolis > #gf-news-feed
                    '457599318996811776',
                ],
            },
        },
    },
    KanColle: {
        LBAS: 'https://i.imgur.com/pmuBMki.png',
        AirPower: 'https://i.imgur.com/SIIJdSz.png',
        Development: 'https://i.imgur.com/ZehPS8X.png',
        Akashi: 'http://akashi-list.me/',
        GunFit: {
            Battleship: 'https://i.imgur.com/a5BatD9.png',
            Cruiser: 'https://i.imgur.com/phWOAU2.png',
            Destroyer: 'https://i.imgur.com/Vcljz6w.png',
        },
        Bonus: {
            All: 'https://imgur.com/a/Sz1hFpK',
            SmallGun: 'https://i.imgur.com/i88R6Vf.png',
            LargeGun: 'https://i.imgur.com/QOslKq8.png',
            Torpedo: 'https://i.imgur.com/vrMGJcz.png',
            Aircraft: 'https://i.imgur.com/KCpZfF1.png',
            Other: 'https://i.imgur.com/t4w6OZU.png',
        },
    },
    Cron: {
        KanColle: [
            // Hitomaru Nuke Zone > #bot-verniy
            '422709303376609290',
            // VN KC > #chat
            '442409008788275200',
            // Quan nhau cua T > #general-viet
            '413622936247992339',
            // Quan nhau cua T > #general-international
            '467951157440937985',
        ],
    },
}