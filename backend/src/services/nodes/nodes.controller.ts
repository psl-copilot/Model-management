import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { TazamaAuthGuard } from "../../guards/tazama-auth.guard";
import { NodesService } from "./nodes.service";
import { CreateNodeDto, ResponseNodeDto } from "./dto";
import { RequireAnyClaims, TazamaClaims } from "../../decorators/auth.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { User } from "../../decorators/user.decorator";
import type { GetNodesQuery } from "./interfaces/node.interface";

@Controller('nodes')
@UseGuards(TazamaAuthGuard)
export class NodesController {
    constructor(private readonly nodesService: NodesService) { }

    @Post('/create')
      @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
    async createNode(@Body() createNodeDto: CreateNodeDto[], @User() user: AuthenticatedUser): Promise<ResponseNodeDto> {
        try {
            return await this.nodesService.createNode(user.token.tokenString, createNodeDto);
        } catch (error) {
            throw error;
        }
    }

    @Get('')
    @RequireAnyClaims(
        TazamaClaims.EDITOR,
        TazamaClaims.APPROVER,
        TazamaClaims.PUBLISHER,
    )
    async getAllNodes(@Query() query: GetNodesQuery, @User() user: AuthenticatedUser): Promise<ResponseNodeDto[]> {
        try {
            return await this.nodesService.getAllNodes(user.token.tokenString, query);
        } catch (error) {
            throw error;
        }
    }
}