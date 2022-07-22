/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { baseLogger } from '../../../../../logger'
import { GetBaseSubcommandGroup } from '../base/get-base-subcommand-group'
import { GetTwitterSpaceCommand } from './get-twitter-space.command'
import { GetTwitterUserCommand } from './get-twitter-user.command'

@Injectable()
export class GetTwitterCommand extends GetBaseSubcommandGroup {
  protected readonly logger = baseLogger.child({ context: GetTwitterCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super(moduleRef)
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      user: GetTwitterUserCommand,
      space: GetTwitterSpaceCommand,
    }[subcommand] || null
    return instance
  }
}
