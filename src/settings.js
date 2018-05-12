module.exports = {
    Global: {
        LocaleCode: 'vi',
        DateOptions: {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        },
    },
    Discord: {
        ClientID: '422330233035948032',
        InviteLink: 'https://discordapp.com/oauth2/authorize?scope=bot&client_id=422330233035948032',
    },
    Twitter: {
        NewTweet: {
            // @HitomaruKonpaku
            '2591243785': {
                channels: {
                    '422709303376609290': {},
                },
            },
            // @KanColle_STAFF
            '294025417': {
                channels: {
                    '422709303376609290': {}, // HitoSpam
                    '441955702781771806': {}, // VN KC > dev-tweet
                    '376294828608061440': {}, // Quan nhau cua T > kc-viet
                    '421681074565939201': {}, // Quan nhau cua T > kc-eng
                },
            },
        },
        NewAva: {
            // @HitomaruKonpaku
            '2591243785': {
                interval: 15,
                channels: [
                    '422709303376609290', // HitoSpam
                ],
            },
            // @KanColle_STAFF
            '294025417': {
                interval: 5,
                channels: [
                    '365111136095305730', // Sad Panda > elsword
                    '422709303376609290', // HitoSpam
                    '441955702781771806', // VN KC > dev-tweet
                    '376294828608061440', // Quan nhau cua T > kc-viet
                    '421681074565939201', // Quan nhau cua T > kc-eng
                ],
                channelsAsUser: [
                    '425302689887289344', // KC Discord > kc-only
                    '345299518012653570', // nicex lolis > boatsluts-kc
                    '334800225191329792', // KC3 > kancolle
                    '98922706317103104',  // Daxyn > kancolle
                    '368557905718542338', // Dzeso > general
                ],
            },
        },
    },
    KanColle: {
        LBAS: 'https://i.imgur.com/PeKxPQU.png',
        Wikia: 'http://kancolle.wikia.com/wiki/',
        Akashi: 'http://akashi-list.me/',
        AirPower: 'https://i.imgur.com/8DcnG08.png',
        Development: 'https://i.imgur.com/ZehPS8X.png',
        GunFit: 'https://i.imgur.com/RLiJubo.png',
        EscortMod: 'https://i.imgur.com/f3U41DI.png',
        OverKill: 'https://i.imgur.com/YG0ub7G.png',
    },
}