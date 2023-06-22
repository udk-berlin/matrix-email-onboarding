import { Get, Controller, Bind, Query, Dependencies, Response, Post, Body, Render } from '@nestjs/common';
import _ from 'lodash';

import { AppService } from './app.service';

@Controller()
@Dependencies(AppService)
export class AppController {
    constructor(appService) {
        this.appService = appService;
    }

    @Get()
    @Bind(Query('t'), Response())
    root(token, response) {
        const invitations = this.appService.findInvitations(token);

        if (_.size(invitations) < 1) {
            return response.render('invalidToken');
        }

        return response.render('login', { namesOfRooms: this.appService.getRoomNames(invitations) });
    }

    @Post()
    @Bind(Query('t'), Body(), Response())
    async login(token, body, response) {
        const invitations = this.appService.findInvitations(token);

        if (!invitations || _.size(invitations) < 1) {
            // Cancel the request if we can't find a valid invitation for the given token
            return response.status(302).redirect('/');
        }

        try {
            await this.appService.acceptInvitationsForUser(body.username, body.password, invitations);
            return response.status(200).redirect('success');
        } catch (error) {
            // Something went wrong
            console.log(error);
            return response.status(500).render('error', { error, token });
        }
    }

    @Get('success')
    @Render('success')
    success() {}
}
