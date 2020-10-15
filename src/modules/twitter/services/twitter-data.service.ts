import { Injectable } from '@nestjs/common'

@Injectable()
export class TwitterDataService {
  public getTweetsConfig() {
    const config = this.transformTweetsData(this.getTweetsData())
    return config
  }

  private getTweetsData() {
    const data = [
      {
        follows: [
          // @HitomaruKonpaku
          '2591243785',
        ],
        channels: {
          // Hitomaru Nuke Zone > #other
          '462085619691290624': {},
          // Hitomaru Nuke Zone > #bot-eveee
          '445769415309524994': {},
        },
        media: undefined,
        retweet: undefined,
        reply: undefined,
      },
      {
        follows: [
          // Tokino Sora
          // @tokino_sora
          '880317891249188864',
          // Roboco
          // @robocosan
          '960340787782299648',
          // Hoshimachi Suisei
          // @suisei_hosimati
          '975275878673408001',
          // Sakura Miko
          // @sakuramiko35
          '979891380616019968',
          // AZKi
          // @AZKi_VDiVA
          '1062499145267605504',
          // Yozora Mel
          // @yozoramel
          '985703615758123008',
          // Shirakami Fubuki
          // @shirakamifubuki
          '997786053124616192',
          // Natsuiro Matsuri
          // @natsuiromatsuri
          '996645451045617664',
          // Aki Rosenthal
          // @akirosenthal
          '996643748862836736',
          // Akai Haato
          // @akaihaato
          '998336069992001537',
          // Minato Aqua
          // @minatoaqua
          '1024528894940987392',
          // Murasaki Shion
          // @murasakishionch
          '1024533638879166464',
          // Nakiri Ayame
          // @nakiriayame
          '1024532356554608640',
          // Yuzuki Choco
          // @yuzukichococh
          '1024970912859189248',
          // Oozora Subaru
          // @oozorasubaru
          '1027853566780698624',
          // Ookami Mio
          // @ookamimio
          '1063337246231687169',
          // Nekomata Okayu
          // @nekomataokayu
          '1109751762733301760',
          // Inugami Korone
          // @inugamikorone
          '1109748792721432577',
          // Usada Pekora
          // @usadapekora
          '1133215093246664706',
          // Uruha Rushia
          // @uruharushia
          '1142975277175205888',
          // Shiranui Flare
          // @shiranuiflare
          '1154304634569150464',
          // Shirogane Noel
          // @shiroganenoel
          '1153195295573856256',
          // Houshou Marine
          // @houshoumarine
          '1153192638645821440',
          // Amane Kanata
          // @amanekanatach
          '1200396304360206337',
          // Kiryu Coco
          // @kiryucoco
          '1200397238788247552',
          // Tsunomaki Watame
          // @tsunomakiwatame
          '1200397643479805957',
          // Tokoyami Towa
          // @tokoyamitowa
          '1200357161747939328',
          // Himemori Luna
          // @himemoriluna
          '1200396798281445376',
          // Yukihana Lamy
          // @yukihanalamy
          '1255013740799356929',
          // Momosuzu Nene
          // @momosuzunene
          '1255017971363090432',
          // Shishiro Botan
          // @shishirobotan
          '1255015814979186689',
          // Omaru Polka
          // @omarupolka
          '1270551806993547265',
          // Mori Calliope
          // @moricalliope
          '1283653858510598144',
          // Takanashi Kiara
          // @takanashikiara
          '1283646922406760448',
          // Ninomae Ina'nis
          // @ninomaeinanis
          '1283650008835743744',
          // Gawr Gura
          // @gawrgura
          '1283657064410017793',
          // Watson Amelia
          // @watsonameliaen
          '1283656034305769472',
        ],
        channels: {
          // Hitomaru Nuke Zone > #hololive
          '766345212548218911': {},
        },
      },
      {
        follows: [
          // @SpaceX
          '34743251',
        ],
        channels: {
          // Hitomaru Nuke Zone > #spacex
          '462085389327532033': {},
          // #chinostare-space-command-center
          '464108896655638548': {},
        },
      },
      {
        follows: [
          // @KanColle_STAFF
          '294025417',
        ],
        channels: {
          // Hitomaru Nuke Zone > #kancolle_staff
          '462085551734915074': {},
          // VN KC > #dev-tweet
          '441955702781771806': {},
          // Quan nhau cua T > #dev-tweet
          '451006611360710656': {},
        },
      },
      {
        follows: [
          // @ArknightsEN
          '1126470462777610241',
          // @ArknightsStaff
          '1027065272371372033',
        ],
        channels: {
          // Loli Group > #bot
          '412994199848353803': {},
        },
      },
      {
        follows: [
          // @FlatIsNice | Tibi | Tibo442
          '3383309523',
        ],
        channels: {
          // Hitomaru Nuke Zone > #flatisnice
          '462085771872960522': {},
          // Quan nhau cua T > #tibot
          '551799151898394677': {},
        },
      },
      {
        follows: [
          // Juuryoushin | juu_kanoya
          '879740556833955840',
        ],
        channels: {
          // Hitomaru Nuke Zone > #juuryoushin
          '589502261902966785': {},
        },
      },
      {
        follows: [
          // Jebzou
          '840258961',
        ],
        channels: {
          // Hitomaru Nuke Zone > #jebzou
          '589502213030936586': {},
        },
      },
      {
        follows: [
          // @vnkeyfc
          '588402934',
        ],
        channels: {
          // VNKFC
          '469009635152494593': {},
          // VNKFC
          '556758874812710923': {},
        },
      },
      {
        follows: [
          // @GirlsFrontline
          '3247835011',
          // @GirlsFrontlineE
          '958921874523607040',
        ],
        channels: {
          // Sad Panda > #gf-tweet
          '458855845669634049': {},
          // lolis > #gf-news-feed
          '457599318996811776': {},
        },
        reply: false,
      },
      {
        follows: [
          // @Battlefield
          '27855118',
          // @TheDivisionGame
          '1499636930',
        ],
        channels: {
          '499935977041821706': {},
          '499936001301544980': {},
        },
        reply: false,
      },
    ]
    return data
  }

  private transformTweetsData(data) {
    const obj = {}
    data.forEach(v => v.follows.forEach(follow => {
      // Create follow user object
      if (!obj[follow]) { obj[follow] = {} }
      // Loop channels object
      Object.keys(v.channels).forEach(channel => {
        // Create channel object
        if (!obj[follow][channel]) { obj[follow][channel] = {} }
        // Get outer config
        Object.keys(v).filter(v => !['follows', 'channels'].includes(v)).forEach(key => obj[follow][channel][key] = v[key])
        // Get inner config
        Object.keys(v.channels[channel]).forEach(key => obj[follow][channel][key] = v.channels[channel][key])
      })
    }))
    return obj
  }
}