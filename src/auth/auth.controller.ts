import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UsersService) { }

    @Get('discord')
    @UseGuards(AuthGuard('discord'))
    async discordLogin() {
        // Handled by passport-discord
    }

    @Get('discord/callback')
    @UseGuards(AuthGuard('discord'))
    async discordCallback(@Req() req: Request, @Res() res: Response) {
        const user = req.user as any;
        await this.usersService.upsertByDiscordId(user.discordId, user.discordProfile, user.accessToken, user.refreshToken);
        // Explicitly log the user in to establish the session and set the cookie
        if (typeof req.login === 'function') {
            req.login(user, (err) => {
                res.redirect(process.env.FRONTEND_HOME_URL || '/');
            });
        } else {
            res.status(500).send('Login method not available');
        }
    }

    @Get('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        if (typeof req.logout === 'function') {
            req.logout(() => {
                res.clearCookie('connect.sid'); // Optional: clear session cookie
                res.json({ success: true });
            });
        } else {
            res.json({ success: true });
        }
    }
}
