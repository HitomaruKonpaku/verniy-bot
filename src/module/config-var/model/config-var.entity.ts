import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { ConfigVarType } from '../enum/config-var-type.enum'

@Entity('config_var')
export class ConfigVar {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Index()
  @Column({ name: 'type', type: 'text' })
  type: ConfigVarType

  @Column({ name: 'value', type: 'text' })
  value: string
}
