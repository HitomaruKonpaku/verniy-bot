import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { HolodexExternalStream } from '../../model/holodex-external-stream.entity'

type AddData = Partial<HolodexExternalStream> & Pick<HolodexExternalStream, 'id' | 'type' | 'sourceId'>

@Injectable()
export class HolodexExternalStreamService extends BaseEntityService<HolodexExternalStream> {
  constructor(
    @InjectRepository(HolodexExternalStream)
    public readonly repository: Repository<HolodexExternalStream>,
  ) {
    super()
  }

  public async add(data: AddData) {
    await this.repository.upsert(
      {
        isActive: true,
        ...data,
      },
      {
        conflictPaths: ['type', 'sourceId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }
}
