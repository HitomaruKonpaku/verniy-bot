import { Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base/base-external.entity'

@Entity('discord_message')
export class DiscordMessage extends BaseExternalEntity {
}
