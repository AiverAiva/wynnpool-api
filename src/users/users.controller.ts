import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import axios from 'axios';
import qs from 'qs';

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthenticatedGuard)
    @Get('me')
    async getMe(@Req() req: Request) {
        const user = req.user as any;
        if (!user || !user.discordId) return user;

        let accessToken = user.accessToken;
        let refreshToken = user.refreshToken;
        let discordProfile = user.discordProfile;
        let roles = user.roles;
        let updated = false;

        // Try to fetch latest profile from Discord
        try {
            if (accessToken) {
                try {
                    const discordRes = await axios.get('https://discord.com/api/users/@me', {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    discordProfile = discordRes.data;
                    updated = true;
                } catch (err: any) {
                    // If token expired, try to refresh
                    if (refreshToken && err.response && err.response.status === 401) {
                        // Refresh access token
                        const params = {
                            client_id: process.env.DISCORD_CLIENT_ID,
                            client_secret: process.env.DISCORD_CLIENT_SECRET,
                            grant_type: 'refresh_token',
                            refresh_token: refreshToken,
                            redirect_uri: process.env.DISCORD_REDIRECT_URI,
                            scope: 'identify email',
                        };
                        const tokenRes = await axios.post(
                            'https://discord.com/api/oauth2/token',
                            qs.stringify(params),
                            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                        );
                        accessToken = tokenRes.data.access_token;
                        refreshToken = tokenRes.data.refresh_token;
                        // Fetch profile with new access token
                        const discordRes = await axios.get('https://discord.com/api/users/@me', {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        });
                        discordProfile = discordRes.data;
                        updated = true;
                    }
                }
            }
        } catch (e) {
            // If all fails, just return DB user
        }
        // Update DB if needed
        if (updated) {
            await this.usersService.upsertByDiscordId(user.discordId, discordProfile, accessToken, refreshToken);
        }
        return { ...user, discordProfile, accessToken, refreshToken };
    }

    @UseGuards(AuthenticatedGuard)
    @Get('roles')
    async getRoles(@Req() req: Request) {
        const user = req.user as any;
        // This is a super fast endpoint: just return roles from session
        return { roles: user?.roles || [] };
    }

    @UseGuards(AuthenticatedGuard)
    @Get('me/quick')
    async getDatabaseUser(@Req() req: Request) {
        const user = req.user as any;
        return user;
    }
}
