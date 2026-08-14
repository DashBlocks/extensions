// Name: Discord Webhook API
// ID: DBDevDiscordWebhookAPI
// Description: Blocks that interact with the Discord Webhook API. Unofficial.
// By: damir2809 (DBDev) <https://scratch.mit.edu/users/damir2809/>

(function(Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed)
        throw new Error("Discord Webhook API extension MUST run unsandboxed!");

    const Cast = Scratch.Cast;
    const NormalObject = Scratch.NormalObject ? Scratch.NormalObject : Map;

    class DiscordWebhookAPIExtension {
        constructor () {
            this.webhook = null;
            this.connected = false;
            this.body = {};
            this.messageInfo = new NormalObject();
        }

        getInfo() {
            return {
                id: "DBDevDiscordWebhookAPI",
                name: "Discord Webhook API",
                color1: "#5865F2",
                iconURI: "data:image/webp;base64,UklGRuwPAABXRUJQVlA4TN8PAAAv/8F/EIegpm0jKPyR3n/bbafSUBtJavP036c3GRlIAoKi/6NR1DaSE/4ct+9e+R2DC/3/DbanPIzDJVyiIrYCeHwX0oLhE7Dob78bR0HbNkyb8Uf9xyAiJkClLfpUoqTxTiBJMcR5Eil+gJlWPmGCzdwb2TZoD3Rq27ZhVqfH//+cskX0fwLYNpKkyN29W5r8w306mrcj+j8BkiTJjSPp2tgSwP/f29sMEw3cIvofkNw2kiQ5dv//y7NVZ0Zk1twi+j8B3HRlRrhZ77211lTlUURV1czcI7Oq+cqV4dabyuKi5pHVn1MZbl1lezEPZN2qMqzJcdWRdaAM7yoHFwvkWSqsCUl11DXSTYWseOQRKr0LbYus5Veo0NfIrXc6xuiodVcohqmRe+50DNVRG07DaA3LTceAHWtNx5gdCy3HsD1X2SEYuERtMQ1jNyywQzB6idpdGhZoWFsH1hi1sXas0mtbZVin5aZSsVLFlkKwVsGCOrDcqOUEFhybCSw5thKCNQs2koJVC7aRgnULNlGKlWtuoQ1rt9pAB1Yftb7E+nN3pThArb214wi9lxY4xNhYKU5Ra12Bc4xdleAgpfbUjqP0XlIKzlJyQ204Tev1JM4zl+M4UN9MKU5Uay2BM42dtOFQrReSONZch+NcfRetOFjpRSSONtcQONvYQRsO13oBJThdqfET54vhHQfsk7fihLXGLsERSw5dOOQcOXHKGDhwzDGu45x91jYctNWgrThpqTELZ51DFg47Ryycdg6YOG6MlzhvDJc4cIyWOHEMFjjyGCtw5jFU4NBjpMCpx0CJY8c4iXPHMImDxyiJk8cghaPPMQpnn0MUDj9HaFy+1ACtp/ehxW84fqN3nL+TBx4wqBMvCOLCEyZt4Q2TtOUPpDgVj6iUjld0wsQzgq7wjknW8g9SXIaHNKrASwZR4ilB03jLImn9CyFxPKZTJF4TBI3nrPftO+z5wHvG44UHzbf1Q/Rpx4v6w4knxbONN61X7U/s0cSj4smWT5F60fGq/mDhWfM9+RZ5LvCu8VjhYfMt/Rh9KvCy8VDjaesd/xp/pvC2+Yr+jT6SeFw80XjdeiF+Jx5oPG/tZ99j2xXeN3fT/2mbJR449pIP0q0SLxw7yQ/pRoknjn3wxtvEH/kuGHtG9pRRxyabxMgqXAWQlkoAMY86Mt+iMe0KN8GP0ZHjRzGPOi2pHWJSlW6C30tDJT99K+ZRJ+U7YMzpiie9H8eT6nlMskHMqMIED0t1U3haLOqMfD2ZT4ULPund2GNfxaPOR5dLDDdd8fHqpfBx9TwcidV0NGmCFb0X+xwAsTyatlhhrumCVauTwqrieS6Sa9lU0gULeye+DADxPJW+VGOk6Yq1pZGSlQCo55FIreQDKVesH3041levA7GFGuMMxZbSh2wAQOM4pNaJYaQLdo0/VWVGuLuZ6bciIvqtmbl7RGbVnwK7itdh+DoYZRg21u8qw91UsbCquUfWd7oNAIujkGVyEOWCvd3NFFureTj2Vq+DiFVsDGm4RMtj6Is0hhiKi9Q4BKk1/B+44DLFz8DX0F/guFA/Al0i5A8mblTqBCRW6L9ArwR2BH2Bkj/ouNQ4Aal5/gcStyp1Aj5P/4BeC+wEdFrKD3RcbB6A5Cz7AYWb1ROwWfID7WrgByCT4gcELrcOIOYYv5Lb0QOwOcLfcL0xn0wJfon7lZovZhg/vSDYfDahhH7ginM8mRD0Su5I5otxnZ7jkn28PqyEfeKaczqpUUHP7knHi1HGLnDRMZ2NEvZyUzqdDEp2jquO6XKMkyu5K5nOxzRyjsv24dqQEu6F25aaTWpEkLPrgg8XI4xb4r6lZrMRwt0uDD6bDEhuiSuv2fKbc9M789n8W6OWuPQarX0qoa63ZqNJfUlqgWvP0fKLU9N7s9H8S2cWuPicrH8R5npzOpl8SGaJq8/J8p0zs7vTyfydEUtcfgxm75SY3Z4Npq9KeBeuv+aSehPE7P58sHhjvAov4GD2pvHyNyDmam+EdskboHPJi+QVeAVzrnwKXvoO2Fzx5LQSL2GN5U+dlr0FPlZ/UlaFt1DG0ocS1v4aIKaSukta8h7oWHkXrAIvYk4Vd8ZK3wSbyu4aqcSrWEO1OyHt74IPJTfFSl4FkanqkqQSL2MMlZcgZW+DDRUX51R4HWsmvxineB9iJrt0Tvo+2Ez9opQKL2SNpBeh7G9EjCQAipO8ETZTAUkp8UrOlEBQ8nciRgrAKek7YSM5YIwK76SMZEBn5C8FcqIONEb6VthEDVBChbdSJlJACMdrgRxIOOl74SMVocJ7KRNVEooXAzlQMrKmzDwyM8JN+1LziMwMN2vKJwpC0pEFf5+uHaknf11hHelAQSjRrkbxwfRuPPlghbaDHMj5RDvOp1M70eTTLt34PG58rBkrfjCkCwl+sKwZnccIodfgh60HK342pRUZqNPJViT5ce/A+PGUTpDjdD7eiSQX9P2cC5Z04vejjWhxydjNuWRpI3o9hT6luKjv5Vy0pA8ZpzU22UhwWdtJuWz2gbwd78O4bsk+UuvQ+/DbsTaUK+c+wZW1DRtH2UgbuRR9F+PS1QamUTaFLo1rl2xSa9HbyGmEbLaRi9H3MC5ebcQwdL0L4+q1R61G68LuxrrI5eg7GJevLvRupAnj+rVDrkdrAldTaDI2oK4n3DC6yJvJLmoHX893qC7iZrwJ4Y65XuxAbcJuxprwLSjL1RbehA4jXNpE7GGrKbfMJjCLcBWarD18Nd+jushZlCq74J6xWuzBLmIU5Yom5GSkCb8Xa0I3ydVyE23CZjEqbcI2qRmsCRnFuHBSNRquJbvwTbgaZ8tbiS5sk1qtZotRnMlny9VyE+3CJ3Eq60I3iRmkCxslBpYZYhN0qZMEmLQLbOKr+R7VhkySVGiz9rARsg3UJElUfcQespru4X3kIDWybZFYvrbQIyui7EO28PVih0KfMUg3UfSB3MHWsx2iER+ETN6Ib1BYX3awRmwUmVg3iA0QG8iJCVt5rBHEerqDrudoVOdQtvFoJ7pcYMtcTjqROYztPNIJYjXdQ1cLtDqHs4MHrepigU1zMemlxgg2aKoXxFq6i64V6DXHSHbSZDOolQzb+kqJZmOMYhdNdKMLBTaOhfTUmt1Tw5Yp2UlqGcOpkd3C4u0gVlFsrasE2vUp9GIs1g9iiTJsrmsEjq1ffG7EAqXYXmuBQMM2hV1icPjHStGg1sccB+cXTA6rz6SgRcnPlOHk4pIs2hMkPlCGNq0+EIKedYq8FIs1BWg+FYJGJZ4qQ9dj1KVZtC3A8oEKRbMa9UAa+pYpcKvjA+L5qwpDyxr1q3RB60O0O/8DvqqZR7ipoHFR8wg3U0H3Q9gd/ojbHCLu8u55VyTyH1F3LRepERSPdvX+FFf3J3DgHyKe8ur51FfHS715e+M3tzdgqH+IeFM3rzct9+CAitdOwP8HexcM8u/g7/IcMkG+awb9d8BHu3f/EgT2rugA/iXvnV+KwP8b6kvrMay/hs9xbf+W78e74v3lt742Bvotoj0bgefzfyFG1C2yvRrR+nr1oelyJuKpx9QwNKZ0kgw9Dw2StDaqOx+Tr7MJCX6fdhaW/D4OKcf0iFr8Zbmcgnjxl6k9sHsM9telA+Nfw07Agn+1DqQ7G4XXQxoQ/wtZrrOpF//s0oBEdzGqXmfZfoDEX0imy1Tiyb+HoEEtdl+j2l4nQ/YDJP5EMkzmEQs+GIoOg+13DMf7LG0A0PwbyXCZRDz5ZCo61GL/Ma4JyOgA0HyAZLrOoJ58NBUtOifERGdgaQeA1RMky016E/Pis2VoUYsT9hmgIL0FwOqRr+kmPYl58uky9OicMWY0CUtbACwe+ppu0ouYJ58PQ4+aHBJTnYT0HgDxeuprhZt0IOZR/GCFoknnlDYHNEztAYDnc99Wuuk+ap7Fz6ajS02OGXOah/QuAI2PfF8ZbirriJpHFj8fijadg2KyEzG1C0C8PvVjVUa4m6mI/EVE1Mw9Iqu4ZrmgTU0OarOSiXTpAtBF/l4/ck9Fm+IcNWe1ULG8jdxk82zDi6MqpgcXmdaDcWTrwZLD+rxiI1M7qJmyA02OW/Pa6MiQ7ZxD+3YSnLdjQRCSLntJTVWylzgnjhVaGFm+VXBs38qKEyuWDEoybR/l4LKPJWf2NYqUTN0lJ4tdNDl1rdHGSoZsYRxdt5Dg2B2Lgpd02SBnyw3EOXis0sys0NWcw9tqEhwdywYzydClpKartTQ4u69T5GTaQs7xfSFLTl/rtLOT5bKI8gB1EfHi+IaFi58slyXqBHIJ8eIB1kptA5AM/VzwCP1zGjzCjqVzBjLtQ8pD1A9Z8hBzrdYhyPJPSJ1CfsSSp9iwOMYgy/Wx4DH6Y+rFc4zVWuYgmS6PGA9SHxFPnqRi+RiFZLr8Seok6m/iycP09Xoakmnyu+BRxh8seZ7YMOYhGfYL42HaLyx4or5DjURW2DdSp1HyjUXxTGuHjplIVigQPM4ANIqn6thzLJIVPNAoHiw2jcFeV9+l5YqKbXHF2KflhoqNccPYqeWCiq1xwdir9X4Nm+f9cre26xm2r+vVfh23iz5gnU7qhcblAmfUuzUcMu+Wp2i/muGYdbU6R8fNHCfVizUcNS+WZ+m4l+O0ci3FcfNaeZ72WxkOXHIprRM1LhU4s92p49B1pzpV40qBc/uNDCfXCzUcPS+UZ+u4j+P0dp2O49d16nyN2wQY+mUMFEvvoiBZdykWjasEeMZNHEztIh1US+6hxaXzHgm2uEaAr9/CwFgv0UC55A5anDrvkGCdV0jwxg0CzOMCDu6+fwN7276Bfunutfl17b75B3PzxRnm3otTzK0X54idJyeJjSdniX0np4ltJ+cZuw5ONDYdnGnsOTjV2HJwrthxcrLYcHK22G9yuthucr652+KEc7PFGedei1Mu3ak251y2UWuO2vfpnHZsMzhv7DI58dxkceYpW5Ti1Et3qM3B+wads8f+ktNP2Z0U51+2OWuuMPYW3CK2ltxj6ca0uUrfl3Ob2FZyn2WbsuZKY0/BrabuSIuL9Q05d4v9JLdbthtrLhiyF0nuuHwr3lxzykakuOrYR3DbqbvQ4sJjE8Gdl2/Bm2tP3YAWV4/9JbffsbtoHmDb3qx5hKU70+IhpuxLkseYsitJHmTIopJHGVsKHmZsKHibHduJ5nl2yl4keaSpO9HkoZbtw4rH2r4Lbx5sxx6iebVpG7Dk6XbI7BLN+4XNbckjrpCJJZqXnD6tF+8ZPqcnrxo+oSdvGzabJQ+84FN5Ns88Q6fRKF57wefwbB59hvJrFG+/MozXopo/mOHCJh7FZyy4sqhn8ysTYfKyWGTxPyvh+p56VvNVKxFu8v/FPLKaj1uJcFP516LmkdV85coEwt3MVFVFPouoqpqZe2RWNTcNAA==",
                blockIconURI: "data:image/webp;base64,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",
                blocks: [
                    {
                        opcode: "init",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "initialize app with webhook url [WEBHOOK_URL]",
                        arguments: {
                            WEBHOOK_URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ""
                            }
                        }
                    },
                    {
                        opcode: "isConnected",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "connected?"
                    },
                    {
                        opcode: "getWebhookInfo",
                        blockType: Scratch.BlockType.OBJECT,
                        text: "webhook info"
                    },
                    {
                        opcode: "setUsername",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set username to [USERNAME]",
                        arguments: {
                            USERNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "WebhookBot"
                            }
                        }
                    },
                    {
                        opcode: "sendMessage",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send message [MESSAGE]",
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Hello, World!"
                            }
                        }
                    },
                    {
                        opcode: "getMessageInfo",
                        blockType: Scratch.BlockType.OBJECT,
                        text: "last sent message info"
                    }
                ]
            };
        }

        async init (args) {
            const webhookUrl = Cast.toString(args.WEBHOOK_URL);
            if ((this.connected && this.webhook === webhookUrl) || !webhookUrl.startsWith("https://discord.com/api/webhooks/")) return;
            this.webhook = webhookUrl;
            const response = await this._makeRequest();
            response.ok ? this.connected = true : this.connected = false;
        }

        async _makeRequest (method = "GET", body = null) {
            if (!this.webhook) return;

            const options = {
                method: method,
                headers: {"Content-Type": "application/json"}
            };
            if (body) {
                options.body = JSON.stringify(body);
            }

            try {
                const response = await fetch(this.webhook + "?wait=true", options);
                return response;
            } catch (e) {
                throw new Error(e);
            }
        }

        isConnected () {
            return this.connected;
        }

        async getWebhookInfo () {
            try {
                const response = await this._makeRequest();
                if (!response) return new NormalObject();
                const json = await response.json();
                return new NormalObject(Object.entries(json));
            } catch (_) {
                return new NormalObject();
            }
        }

        setUsername (args) {
            this.body.username = Cast.toString(args.USERNAME);
        }

        async sendMessage (args) {
            const message = Cast.toString(args.MESSAGE);

            try {
                const data = await this._makeRequest("POST", {
                    ...this.body,
                    content: message
                });
                this.messageInfo = new NormalObject(Object.entries(await data.json()));
            } catch (_) {}
        }

        getMessageInfo () {
            return this.messageInfo;
        }
    }
    Scratch.extensions.register(new DiscordWebhookAPIExtension());
})(Scratch);
