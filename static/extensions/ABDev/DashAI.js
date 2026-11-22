/* Author: ABDev */
(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('DashAI должен запускаться в unsandboxed-режиме!');
    }

    const PROVIDERS = {
        pollinations: {
            url: 'https:
            defaultModel: 'openai',
            format: 'openai'
        },
        openai: {
            url: 'https:
            defaultModel: 'gpt-4o-mini',
            format: 'openai'
        },
        anthropic: {
            url: 'https:
            defaultModel: 'claude-3-5-haiku-latest',
            format: 'anthropic'
        },
        groq: {
            url: 'https:
            defaultModel: 'llama-3.3-70b-versatile',
            format: 'openai'
        },
        openrouter: {
            url: 'https:
            defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
            format: 'openai'
        },
        gemini: {
            url: 'https:
            defaultModel: 'gemini-2.0-flash',
            format: 'openai'
        },
        custom: {
            url: '',
            defaultModel: 'openai',
            format: 'openai'
        }
    };

    class DashAI {
        constructor() {
            this.provider = 'pollinations';
            this.endpoint = PROVIDERS.pollinations.url;
            this.apiFormat = 'openai'; 
            this.apiKey = '';
            this.model = PROVIDERS.pollinations.defaultModel;
            this.systemPrompt = 'Ты полезный и дружелюбный ИИ-ассистент в DashBlocks.';
            this.temperature = 0.7;
            this.maxTokens = 1024;
            this.history = []; 
            this.maxHistory = 20;
            this.lastResponse = '';
            this.lastError = '';
            this.isBusy = false;
        }

        getInfo() {
            return {
                id: 'dashAI',
                name: 'DashAI',
                color1: '#6C5CE7',
                color2: '#5B4BC4',
                color3: '#4839A3',
                menus: {
                    providers: {
                        acceptReporters: true,
                        items: [
                            { text: 'Pollinations (бесплатно)', value: 'pollinations' },
                            { text: 'OpenAI', value: 'openai' },
                            { text: 'Anthropic (Claude)', value: 'anthropic' },
                            { text: 'Groq', value: 'groq' },
                            { text: 'OpenRouter', value: 'openrouter' },
                            { text: 'Google Gemini', value: 'gemini' },
                            { text: 'Свой (Custom)', value: 'custom' }
                        ]
                    },
                    apiFormats: {
                        acceptReporters: true,
                        items: [
                            { text: 'OpenAI-совместимый', value: 'openai' },
                            { text: 'Anthropic', value: 'anthropic' }
                        ]
                    }
                },
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Настройки подключения'
                    },
                    {
                        opcode: 'setProvider',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'выбрать провайдера [PROVIDER]',
                        arguments: {
                            PROVIDER: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'providers',
                                defaultValue: 'pollinations'
                            }
                        }
                    },
                    {
                        opcode: 'setCustomEndpoint',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'своя ссылка API [URL] формат [FORMAT]',
                        arguments: {
                            URL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'https:
                            },
                            FORMAT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'apiFormats',
                                defaultValue: 'openai'
                            }
                        }
                    },
                    {
                        opcode: 'setModel',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'выбрать модель [MODEL]',
                        arguments: {
                            MODEL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'openai'
                            }
                        }
                    },
                    {
                        opcode: 'setApiKey',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'установить API ключ [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'setSystemPrompt',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'задать системный промпт [PROMPT]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Ты полезный и дружелюбный ИИ-ассистент.'
                            }
                        }
                    },
                    {
                        opcode: 'setTemperature',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'креативность (temperature) [TEMP]',
                        arguments: {
                            TEMP: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0.7
                            }
                        }
                    },
                    {
                        opcode: 'getCurrentProvider',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'текущий провайдер'
                    },
                    {
                        opcode: 'getCurrentURL',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'текущий API URL'
                    },

                    '---',
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Общение с ИИ'
                    },
                    {
                        opcode: 'askAndWait',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'спросить ИИ [PROMPT] и ждать ответ',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Привет! Как дела?'
                            }
                        }
                    },
                    {
                        opcode: 'askToVariable',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'спросить ИИ [PROMPT] и записать в переменную [VAR]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Привет!'
                            },
                            VAR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'ответ ИИ'
                            }
                        }
                    },
                    {
                        opcode: 'askSimple',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'быстрый ответ ИИ на [PROMPT]',
                        arguments: {
                            PROMPT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Назови случайное число от 1 до 10'
                            }
                        }
                    },
                    {
                        opcode: 'getLastResponse',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'последний ответ ИИ'
                    },
                    {
                        opcode: 'isThinking',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'ИИ сейчас думает?'
                    },
                    {
                        opcode: 'getLastError',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'последняя ошибка ИИ'
                    },

                    '---',
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'Память, история и переменные'
                    },
                    {
                        opcode: 'clearHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'очистить историю диалога'
                    },
                    {
                        opcode: 'setMaxHistory',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'максимум сообщений в памяти [COUNT]',
                        arguments: {
                            COUNT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 20
                            }
                        }
                    },
                    {
                        opcode: 'getHistoryCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'сообщений в истории'
                    },
                    {
                        opcode: 'saveHistoryToVar',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'сохранить историю в переменную [VAR]',
                        arguments: {
                            VAR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'история_чата'
                            }
                        }
                    },
                    {
                        opcode: 'loadHistoryFromVar',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'загрузить историю из переменной [VAR]',
                        arguments: {
                            VAR: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'история_чата'
                            }
                        }
                    },
                    {
                        opcode: 'getHistoryJSON',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'история диалога (JSON)'
                    },
                    {
                        opcode: 'loadHistoryJSON',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'загрузить историю из JSON [JSON]',
                        arguments: {
                            JSON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '[]'
                            }
                        }
                    }
                ]
            };
        }

        setProvider(args) {
            const key = String(args.PROVIDER || 'pollinations').trim().toLowerCase();
            const preset = PROVIDERS[key];
            if (preset) {
                this.provider = key;
                if (preset.url) this.endpoint = preset.url;
                this.apiFormat = preset.format;
                this.model = preset.defaultModel;
            }
        }

        setCustomEndpoint(args) {
            const url = String(args.URL || '').trim();
            const fmt = String(args.FORMAT || 'openai').trim().toLowerCase();
            this.provider = 'custom';
            if (url) this.endpoint = url;
            this.apiFormat = fmt === 'anthropic' ? 'anthropic' : 'openai';
        }

        setModel(args) {
            this.model = String(args.MODEL || 'openai').trim();
        }

        setApiKey(args) {
            this.apiKey = String(args.KEY || '').trim();
        }

        setSystemPrompt(args) {
            this.systemPrompt = String(args.PROMPT || '');
        }

        setTemperature(args) {
            let t = Number(args.TEMP);
            if (!Number.isFinite(t)) t = 0.7;
            this.temperature = Math.max(0, Math.min(2, t));
        }

        getCurrentProvider() {
            return this.provider;
        }

        getCurrentURL() {
            return this.endpoint;
        }

        _getOrCreateVariable(util, name) {
            const varName = String(name || '').trim();
            if (!varName) return null;

            let variable = util.target.lookupVariableByNameAndType(varName, '');
            if (variable) return variable;

            const stage = Scratch.vm.runtime.getTargetForStage();
            if (stage) {
                variable = stage.lookupVariableByNameAndType(varName, '');
                if (!variable) {
                    const id = 'dashai_' + varName + '_' + Math.random().toString(36).slice(2, 8);
                    variable = stage.createVariable(id, varName, '');
                }
            }
            return variable;
        }

        _readVariable(util, name) {
            const varName = String(name || '').trim();
            if (!varName) return '';
            const variable = util.target.lookupVariableByNameAndType(varName, '');
            return variable ? String(variable.value) : '';
        }

        clearHistory() {
            this.history = [];
        }

        setMaxHistory(args) {
            const n = Math.floor(Number(args.COUNT));
            this.maxHistory = Number.isFinite(n) && n >= 0 ? n : 20;
            this._trimHistory();
        }

        getHistoryCount() {
            return this.history.length;
        }

        saveHistoryToVar(args, util) {
            const variable = this._getOrCreateVariable(util, args.VAR);
            if (variable) {
                variable.value = JSON.stringify(this.history);
            }
        }

        loadHistoryFromVar(args, util) {
            const raw = this._readVariable(util, args.VAR);
            if (raw) {
                this.loadHistoryJSON({ JSON: raw });
            }
        }

        getHistoryJSON() {
            return JSON.stringify(this.history);
        }

        loadHistoryJSON(args) {
            try {
                const parsed = JSON.parse(String(args.JSON || '[]'));
                if (Array.isArray(parsed)) {
                    this.history = parsed.filter(
                        m => m && typeof m.role === 'string' && typeof m.content === 'string'
                    );
                    this._trimHistory();
                    this.lastError = '';
                }
            } catch (e) {
                this.lastError = 'Ошибка JSON истории: ' + e.message;
            }
        }

        getLastResponse() {
            return this.lastResponse;
        }

        isThinking() {
            return this.isBusy;
        }

        getLastError() {
            return this.lastError;
        }

        _trimHistory() {
            if (this.maxHistory === 0) {
                this.history = [];
                return;
            }
            if (this.history.length > this.maxHistory) {
                this.history = this.history.slice(this.history.length - this.maxHistory);
            }
        }

        async _sendRequest(messages) {
            if (!this.endpoint) {
                throw new Error('Не указан API URL');
            }

            if (this.apiFormat === 'anthropic') {
                return await this._sendAnthropic(messages);
            }
            return await this._sendOpenAI(messages);
        }

        async _sendOpenAI(messages) {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const body = {
                model: this.model,
                messages: messages,
                temperature: this.temperature
            };

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
            }

            const data = await response.json();
            const reply =
                data?.choices?.[0]?.message?.content ??
                data?.choices?.[0]?.text ??
                data?.response ??
                '';

            return String(reply).trim();
        }

        async _sendAnthropic(messages) {
            const headers = {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            };
            if (this.apiKey) {
                headers['x-api-key'] = this.apiKey;
            }

            const nonSystem = messages.filter(m => m.role !== 'system');
            const body = {
                model: this.model,
                max_tokens: this.maxTokens,
                temperature: Math.min(1, this.temperature),
                messages: nonSystem
            };
            if (this.systemPrompt) {
                body.system = this.systemPrompt;
            }

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
            }

            const data = await response.json();
            const reply = data?.content?.[0]?.text ?? '';
            return String(reply).trim();
        }

        async askAndWait(args) {
            const prompt = String(args.PROMPT || '').trim();
            if (!prompt) return;

            this.isBusy = true;
            this.lastError = '';

            try {
                const messages = [];
                if (this.systemPrompt) {
                    messages.push({ role: 'system', content: this.systemPrompt });
                }
                for (const item of this.history) {
                    messages.push(item);
                }
                messages.push({ role: 'user', content: prompt });

                const reply = await this._sendRequest(messages);
                this.lastResponse = reply;

                this.history.push({ role: 'user', content: prompt });
                this.history.push({ role: 'assistant', content: reply });
                this._trimHistory();
            } catch (e) {
                this.lastError = e.message || String(e);
                this.lastResponse = '';
            } finally {
                this.isBusy = false;
            }
        }

        async askToVariable(args, util) {
            await this.askAndWait({ PROMPT: args.PROMPT });
            const variable = this._getOrCreateVariable(util, args.VAR);
            if (variable) {
                variable.value = this.lastResponse;
            }
        }

        async askSimple(args) {
            const prompt = String(args.PROMPT || '').trim();
            if (!prompt) return '';

            this.isBusy = true;
            this.lastError = '';

            try {
                const messages = [];
                if (this.systemPrompt) {
                    messages.push({ role: 'system', content: this.systemPrompt });
                }
                messages.push({ role: 'user', content: prompt });

                const reply = await this._sendRequest(messages);
                this.lastResponse = reply;
                return reply;
            } catch (e) {
                this.lastError = e.message || String(e);
                return '';
            } finally {
                this.isBusy = false;
            }
        }
    }

    Scratch.extensions.register(new DashAI());
})(Scratch);
