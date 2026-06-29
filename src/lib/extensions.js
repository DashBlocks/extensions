/*
    Note to contributors & developers that can read JSON:
        The extra commas are added at the end of each thing
        to help copy & pasting work better.
        Please, don't remove them :)
*/

const extensions = [
{
        name: "Ding Dong Ditch",
        description: "Some joke extension I did for fun. Originally from Magic Mod.",
        code: "GaiaWindWave90/DingDongDitch.js",
        banner: "GaiaWindWave90/DingDongDitch.svg",
        creator: "GaiaWindWave90",
        isGitHub: true,        
    },
];

//Extensions that were taken from Dash Blocks
const dbExtensions = [
    {
        name: "Playgama Bridge SDK",
        id: "playgama",
        description:
            "Blocks that initialize and interact with the Playgama Bridge SDK. Official.",
        code: "https://github.com/playgama/bridge-scratch/releases/latest/download/PlaygamaBridge.js",
        // banner: "Playgama/PlaygamaBridge.svg",
        creator: [
            { name: "Playgama", link: "_github_" },
            { name: "sergei-playgama", link: "_github_" },
            { name: "DBDev-IT", link: "_github_" },
        ],
    },
    {
        name: "YaGames SDK",
        id: "yagames",
        description:
            "Blocks that initialize and interact with the Yandex Games SDK. Unofficial.",
        code: "timaaos/YaGames.js",
        banner: "timaaos/YaGames.svg",
        creator: [
            { name: "timaaos", link: "_github_" },
            { name: "scratch_craft_2", link: "_scratch_" },
            { name: "Den4ik-12", link: "https://github.com/DDen4ik-12" },
            { name: "DBDev-IT", link: "_github_" },
        ],
    },
    {
        name: "Telegram Bot API",
        id: "TelegramBotAPI",
        description:
            "Blocks that interact with the Telegram API for bots. Unofficial.",
        code: "damir2809/TelegramBotAPI.js",
        banner: "damir2809/TelegramBotAPI.svg",
        creator: [
            { name: "DBDev-IT", link: "_github_" },
            { name: "scratch_craft_2", link: "_scratch_" },
            { name: "ttt999", link: "_scratch_" },
            { name: "By-ROlil-CO", link: "_scratch_" },
            { name: "AnonimKing24", link: "_scratch_" },
            { name: "Den4ik-12", link: "https://github.com/DDen4ik-12" },
        ],
        internetConnectionRequired: true,
    },
    {
        name: "Discord Webhook API",
        id: "DBDevDiscordWebhookAPI",
        description:
            "Blocks that interact with the Discord Webhook API. Unofficial.",
        code: "damir2809/DiscordWebhookAPI.js",
        // banner: "damir2809/DiscordWebhookAPI.svg",
        creator: { name: "DBDev-IT", link: "_github_" },
        notes: "Beta-version.",
        internetConnectionRequired: true,
    },
    {
        name: "Pathfinding",
        id: "Den4ik12Pathfinding",
        description:
            "Find paths from one position to another, avoiding obstacles.",
        code: "Den4ik-12/Pathfinding.js",
        banner: "Den4ik-12/Pathfinding.svg",
        creator: { name: "Den4ik-12", link: "https://github.com/DDen4ik-12" },
    },
    {
        name: "Wheel Scroll",
        id: "Den4ik12WheelScroll",
        description: "Blocks for detecting mouse wheel scrolling.",
        code: "Den4ik-12/WheelScroll.js",
        banner: "Den4ik-12/WheelScroll.svg",
        creator: { name: "Den4ik-12", link: "https://github.com/DDen4ik-12" },
    },
    {
        name: "Maps",
        id: "Den4ik12Maps",
        description:
            "Blocks for working with Map, which is more powerful than Object.",
        code: "Den4ik-12/Maps.js",
        banner: "Den4ik-12/Maps.svg",
        creator: { name: "Den4ik-12", link: "https://github.com/DDen4ik-12" },
    },
    {
        name: "Targets",
        id: "Den4ik12Targets",
        description:
            "Easily manage your sprites, clones, and their properties.",
        code: "Den4ik-12/Targets.js",
        banner: "Den4ik-12/Targets.svg",
        creator: { name: "Den4ik-12", link: "https://github.com/DDen4ik-12" },
    },
    {
        name: "Modals",
        id: "htmlalert",
        description: "Control classic modal windows in browsers!",
        code: "scratch_craft_2/Modals.js",
        banner: "scratch_craft_2/Modals.png",
        creator: { name: "scratch_craft_2", link: "_scratch_" },
    },
    {
        name: "MediaRecorder",
        id: "MediaRecord",
        description: "Record your projects directly in Dash!",
        code: "scratch_craft_2/MediaRecorder.js",
        creator: { name: "scratch_craft_2", link: "_scratch_" },
    },
    {
        name: "Arduino ULTIMATE",
        id: "arduinoUltimate",
        description: "Allows you to control Arduino directly from the browser. Supports digital/analog I/O, PWM, Servo, I2C, basic sensors and devices.",
        code: "scratch_craft_2/ArduinoULTIMATE.js",
        // banner: "scratch_craft_2/ArduinoULTIMATE.png",
        creator: { name: "scratch_craft_2", link: "_scratch_" },
        notes: "REQUIRED: The board must be flashed with StandardFirmata and the browser must support Web Serial (Chrome/Edge).",
    },
    {
        name: "Notification",
        id: "notification",
        description: "Send notifications with icons.",
        code: "shilenin/Notification.js",
        banner: "shilenin/Notification.svg",
        creator: { name: "shilenin", link: "_scratch_" },
    },
    {
        name: "Code Cleaner",
        id: "ultimateBlockCleaner",
        description: "Clean and optimize your code!",
        code: "shilenin/CodeCleaner.js",
        banner: "https://raw.githubusercontent.com/Mirazstudio-offical/Dash_code_cleaner_extension/refs/heads/main/logo.svg",
        creator: { name: "shilenin", link: "_scratch_" },
        scratchCompatible: true,
    },
    {
        name: "JavaScript Runner",
        id: "shaman2016JavaScriptRunner",
        description: "Run the JavaScript code!",
        code: "shaman2016/JavaScriptRunner.js",
        banner: "shaman2016/JavaScriptRunner.svg",
        creator: [
            { name: "polzovatel_8787", link: "_dash_" },
            { name: "DBDev-IT", link: "_github_" },
        ],
    },
    {
        name: "Auto Save",
        id: "qbacksAutosSave",
        description: "Several features for games",
        code: "QBacks/AutoSave.js",
        banner: "QBacks/AutoSave.svg",
        creator: { name: "QBacks", link: "_scratch_" },
    },
];

// Extensions that were taken from PenguinMod
// (PenguinMod's extensions were added here for IDs addition)
const pmExtensions = [
    {
        name: "Pen+",
        description: "Extended pen section! Adds blocks for drawing triangles using textures and tints, drawing images and editing their pixels, etc.",
        code: "ObviousAlexC/PenPlus.js",
        banner: "ObviousAlexC/PenPlus.svg",
        creator: "pinksheep2917",
    },
    {
        name: "Shovel Debugger",
        description: "Shovel's improved and feature rich debugger!",
        code: "TheShovel/shoveldebugger.js",
        banner: "TheShovel/thumbnail-shoveldebugger.avif",
        isGitHub: true,
        creator: "TheShovel",
    },
    {
        name: "Server Storage",
        description: "Similar to the server storage blocks in the 'Storage' extension, but with a better server uptime and non-global keys.\nDid you know the server is open source?",
        code: "Ikelene/serverStorageExtension.js",
        banner: "Ikelene/serverStorageIMG.avif",
        creator: "Ikelene",
        isGitHub: true,
    },
    {
        name: "Storage Plus",
        description: "A storage extension with many more features. Featuring server storage (with a fast server), local storage and more!",
        code: "Gen1x/storage_plus.js",
        banner: "Gen1x/storage_plus.avif",
        creator: "G1nX",
    },
    {
        name: "MotionSprite",
        description: "An advanced math-based animation system",
        code: "TheShovel/qoan-renderer.js",
        banner: "TheShovel/thumbnail-motionsprite.avif",
        isGitHub: true,
        creator: "TheShovel",
    },
    {
        name: "Boxed Physics",
        description: "Implements the Box2D physics engine into PenguinMod, adding joints, springs, etc. This is different from TurboWarp's implementation.",
        code: "pooiod/Box2D.js",
        banner: "pooiod/B2Dimg.svg",
        creator: "pooiod7",
    },
    {
        name: "Lighting",
        description: "A fast, powerful and easy-to-use lighting engine powered by WebGL!",
        code: "Gen1x/lighting.js",
        banner: "Gen1x/lighting.avif",
        creator: "G1nX",
        tags: ["new"],
    },
    {
        name: "3D Math",
        description: "A handful of utilities for making your own sprite-based 3D engine.",
        code: "ObviousAlexC/3DMath.js",
        banner: "ObviousAlexC/3DMath.svg",
        creator: "pinksheep2917",
    },
    {
        name: "GPU.sb3",
        description: "Use WebGPU compute shaders to accelerate your projects. Use Pen+ for rendering, not this.",
        code: "derpygamer2142/gpusb3.js",
        banner: "derpygamer2142/gpusb3.png",
        creator: "insanetaco2000",
        creatorAlias: "derpygamer2142",
        isGitHub: false,
        unstable: true,
        unstableReason: "WebGPU is still experimental and not supported by all browsers and does not work when packaged to electron. Check compatibility at webgpu.io."
    },
    {
        name: "Beat Sync",
        description: "An extension designed to let you sync anything in your project to a musical beat, with incredible precision.",
        code: "Gen1x/beat_sync.js",
        banner: "Gen1x/beat_sync.avif",
        creator: "G1nX",
    },
    {
        name: "Object",
        description: "Handle large JSON files at an extreme speed.",
        code: "skyhigh173/object.js",
        banner: "skyhigh173/object.svg",
        creator: "skyhigh173",
        isGitHub: true,
    },
    /*{
        name: "Scope Variable",
        description: "Manage your variables in a block-like structure.",
        code: "0znzw/ScopeVars.js",
        banner: "0znzw/ScopeVars.avif",
        creator: "yuri-kiss",
        isGitHub: true,
        unstable: true,
        unstableReason: "This extension uses unstable techniques that may not always work.",
    },*/
    {
        name: "Extra Timers",
        description: "Allows for the creation and management of additional timer blocks.",
        notes: "thumbnail by Dillon",
        code: "steve0greatness/timers.js",
        banner: "steve0greatness/timers.svg",
        creator: "Steve0Greatness",
        isGitHub: true, 
    },
    
    {
        name: "Dictation",
        description: "Convert your voice into text. (not supported in all browsers)",
        code: "pooiod/Dictation.js",
        banner: "pooiod/Dictation.svg",
        creator: "pooiod7",
    },
        {
        name: "Doodle Recognition",
        description: "A implementation of Google's Quick Draw image vision model",
        code: "TheShovel/doodlerec.js",
        banner: "TheShovel/thumbnail-doodlerec.avif",
        creator: "TheShovel",
        isGitHub: true,
    },
            {
        name: "Stylus",
        description: "Get the pressure and tilt of a stylus or graphic tablet",
        code: "sourdoggy/stylus extension.js",
        banner: "sourdoggy/stylus_ext.avif",
        creator: "sourdoggy",
        isGitHub: true,
    },
    {
        name: "Text To Speech: Redone",
        description: "A better alternitive to the base text to speech extension. Powered by the TTStool API",
        code: "PuzzlingGGG/ttsr.js",
        banner: "PuzzlingGGG/TTSR.avif",
        creator: "PuzzlingGGG",
        isGitHub: true,
    },
    {
        name: "CloudLink",
        description: "A powerful WebSocket extension for Scratch. Allows for online connectivity to servers for things like multiplayer.",
        code: "MikeDev101/cloudlink.js",
        banner: "MikeDev101/cloudlink.svg",
        creator: "MikeDev101",
        isGitHub: true,
    },
    {
        name: "E2EE",
        description: "A general-purpose E2EE (End-to-End Encryption) extension for Scratch.",
        code: "MikeDev101/e2ee.js",
        banner: "MikeDev101/e2ee.svg",
        creator: "MikeDev101",
        isGitHub: true,
    },
    {
        name: "WebRTC",
        description: "A barebones WebRTC implementation.",
        code: "MikeDev101/webrtc.js",
        banner: "MikeDev101/webrtc.svg",
        creator: "MikeDev101",
        isGitHub: true,
    },
    {
        name: "Spritesheeter",
        description: "Load and manipulate spritesheets with customizable frames and XML support",
        code: "MubiLop/spritesheeter.js",
        banner: "MubiLop/spritesheeter.avif",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        isGitHub: true
    },
    {
        name: "Background Remover",
        description: "Removes background from images.",
        code: "dumzdev/removebg.js",
        banner: "dumzdev/removebgbanner.svg",
        creator: "dumzdev",
    },
    /*{
        name: "PenguinAI",
        description: "Talk to AI! Use Models like DALL-E-3, GPT, LLama, Claude, and more!",
        code: "MubiLop/penguingpt.js",
        banner: "MubiLop/penguingpt.avif",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        isGitHub: true,
        unstable: true,
        documentation: "PenguinAI",
        unstableReason: "AI models can generate unintended or inappropriate output.\nSome AI models may also become temporarily inaccessible.\n\nUse at your own risk.",
    },*/
/*
    {
        name: "Block AI",
        description: "An AI powered chat bot to help you code in your projects.",
        code: "TheShovel/blockAI.js",
        banner: "TheShovel/thumbnail-blockAI.avif",
        creator: "TheShovel",
        creatorAlias: "TheShovel",
        isGitHub: true,
        unstable: true,
        unstableReason: "The AI model can generate inaccurate output and broken syntax!",
    },
*/
    {
        name: "PenguinHook",
        description: "Send Webhook requests, that can be Discord or any type of webhook.",
        code: "MubiLop/penguinhook.js",
        banner: "MubiLop/penguinhook.avif",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        isGitHub: true,
    },
    {
        name: "Number Utilities",
        description: "Adds blocks for number formatting and manipulation.",
        code: "MubiLop/numutils.js",
        banner: "MubiLop/numutils.avif",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        notes: "Art made by hazel",
        documentation: "NumberUtilities",
        isGitHub: true,
    },
    {
        name: "Mathematics",
        description: "Complicated maths extension for nerds.",
        code: "jwklong/mathematics.js",
        banner: "jwklong/mathematics.avif",
        creator: "jwklong",
        isGitHub: true,
    },
    {
        name: "Big Decimal",
        description: "High precision operations. (Support decimals)",
        code: "qxsck/big-decimal.js",
        banner: "qxsck/big-decimal.svg",
        creator: "qxsck",
        isGitHub: true,
    },
    /* Use the TurboWarp version. This one is outdated and broken.
    {
        name: "Format Numbers",
        description: "Format large numbers into AD standard, fixed decimal, comma separated, or scientific notation.",
        code: "DogeisCut/FormatNumbers.js",
        banner: "DogeisCut/FormatNumbers.avif",
        creator: "DogeisCut",
        isGitHub: true, 
        notes: "Gallery banner by Dillon",
    },
    */
    {
        name: "Date Format",
        description: "Manage, format and compare dates.",
        code: "ddededodediamante/dateFormatV2.js",
        banner: "ddededodediamante/dateFormat.svg",
        creator: "ddededodediamante",
        documentation: "DateFormatV2",
        tags: ["customtype", "utility", "small", "data", "time", "text"],
        isGitHub: true,
    },
    {
        name: "Translation Keys",
        description: "Use translation keys in your projects for multi-language support",
        code: "Embin/embintranslation.js",
        banner: "Embin/embintranslation.avif",
        creator: "embinmc",
        isGitHub: true, 
        tags: ["data", "utility", "text", "strings"],
        creatorAlias: "Embin",
    },
    {
        name: "Yet Another String Extension",
        description: "A small collection of utilty blocks intended to make managing strings much, much easier.",
        code: "DogeisCut/YetAnotherStringExtension.js",
        banner: "DogeisCut/YetAnotherStringExtension.svg",
        creator: "DogeisCut",
        isGitHub: true, 
        tags: ["strings", "builder", "small", "text", "utility"]
    },
    {
        name: "Regular Expressions",
        description: "Create, modify, filter, and more with the new regular expression type.",
        code: "DogeisCut/dogeiscutRegularExpressions.js",
        banner: "DogeisCut/dogeiscutRegularExpressions.svg",
        creator: "DogeisCut",
        isGitHub: true, 
        tags: ["customtype", "strings", "regex", "text", "utility"]
    },
    {
        name: "Sets",
        description: "Store non-repeating, unordered data super efficiently in sets.",
        code: "DogeisCut/dogeiscutSet.js",
        banner: "DogeisCut/dogeiscutSet.svg",
        creator: "DogeisCut",
        isGitHub: true, 
        tags: ["customtype", "sets", "data", "utility"]
    },
    {
        name: "Iterators",
        description: "Transform and iterate over different types of collections and more.",
        code: "Div/divIterators.js",
        banner: "Div/divIterators.svg",
        creator: "Dicuo",
        creatorAlias: "Div",
        isGitHub: true,
        tags: ["new", "customtype", "iterators", "data", "utility", "builder"]
    },
    {
        name: "Algebraic Effects",
        description: "Intercept custom actions in your scripts to pause, resume, or redirect their flow using modular handlers.",
        code: "Div/divAlgEffects.js",
        banner: "Div/divAlgEffects.svg",
        creator: "Dicuo",
        creatorAlias: "Div",
        isGitHub: true,
        tags: ["new", "effects", "control", "data", "utility"]
    },
    {
        name: "Blobs",
        description: "An extension made for handling blobs which can be used to store files. Allows to easily make blobs for the Js extension",
        code: "Faunks/Blobs.js",
        banner: "Faunks/Blobs.avif",
        creator: "Faunks",
        isGitHub: true,
    },
    {
        name: "Random Utilities",
        description: "Many blocks related to generating random values, including seed-based number generation, true number generation, UUID's, random strings, etc.",
        code: "Gen1x/random_utils.js",
        banner: "Gen1x/randomutils.avif",
        creator: "G1nX",
    },
    {
        name: "Toast Notifications",
        description: "Did you want alerts? Notifications that are easily customizable? This is the only and best notification extension!",
        code: "MubiLop/toastnotifs.js",
        banner: "MubiLop/toastnotifs.avif",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        notes: "Additional code by themeatly2 and ddededodediamante",
        isGitHub: true,
    },
    {
        name: "Project Interfaces",
        description: "Effortlessly create intuitive graphical user interfaces in your projects.",
        code: "LordCat0/ProjectInterfaces.js",
        banner: "LordCat0/ProjectInterfaces.avif",
        creator: "LordCat0",
        creatorAlias: "Lord cat",
        notes: "Gallery banner by Dillon",
        isGitHub: true,
    },
    {
        name: "Git Penguin",
        description: "Make requests and control the files for your GitHub repository.",
        code: "justablock/gitpenguin.js",
        banner: "justablock/gitpenguin.avif",
        creator: "justablock",
        isGitHub: false, 
    },
    {
        name: "Pang API",
        description: "Fetch information from the PenguinMod API.",
        code: "SammerLOL/pangapi.js",
        banner: "SammerLOL/pangapi.avif",
        creator: "oc9x97",
        isGitHub: true,
    },
    {
        name: "TurboWeather",
        description: "Show weather and location data for any place in our world. Data that could be used for doxxing is deleted from results.",
        code: "RubyDevs/turboweather.js",
        banner: "RubyDevs/turboweather.avif",
        documentation: "TurboWeather",
        creator: "RubyDevs",
    },
    {
        name: "Cockatiel Location",
        description: "Fetch Users' IP Addresses and Location.",
        code: "bruhbeast-pixel/CockatielLocation.js",
        banner: "bruhbeast-pixel/CockatielLocation.svg",
        creator: "bruhbeast-pixel",
        isGitHub: true,
    },
    {
        name: "CORS Proxy",
        description: "Accessible CORS Proxies for fetching information with PenguinMod.",
        code: "NamelessCat/corsproxy.js",
        banner: "NamelessCat/corsproxy.avif",
        creator: "NamelessCat",
    },
    {
        name: "Extension Exposer",
        description: "Access the raw functions from other extensions.",
        code: "TheShovel/extexp.js",
        banner: "TheShovel/placeholder-extexp.avif",
        creator: "TheShovel",
        isGitHub: true,
        notes: "Some contributions by yuri-kiss :P",
    },
    {
        name: "All Menus",
        description: "Every dropdown menu for each block, in one extension.",
        code: "Lily/AllMenus.js",
        banner: "Lily/AllMenus.svg",
        creator: "LilyMakesThings",
        isGitHub: false,
    },
    {
        name: "More Fields",
        description: "Custom Field Types",
        code: "Ashime/MoreFields.js",
        banner: "0znzw/MoreFields.avif",
        creator: "yuri-kiss",
        isGitHub: true,
    },
    {
        name: "Beepbox Player",
        description: "Play, edit, and read songs from any BeepBox mod directly from the URL or JSON!",
        code: "DogeisCut/BeepBoxPlayer.js",
        banner: "DogeisCut/BeepBoxPlayer.svg",
        creator: "DogeisCut",
        isGitHub: true, 
        tags: ["api", "music", "sounds", "ultrabox", "jummbox", "beepbox"]
    },
    {
        name: "Update File (Direct Access)",
        description: "A simple extension that uses the File System Access API to update files dynamically.",
        code: "Anonymous_cat1/updateFile.js",
        banner: "Anonymous_cat1/updateFile.svg",
        creator: "Anonymous-cat1",
        isGitHub: true,
        unstable: true,
        unstableReason: "File System Access is not supported by all browsers.\nProjects can maliciously edit files that you open.",
    },
    {
        name: "YeetYourFiles",
        description: "Upload files to the cloud by throwing it to outer space!",
        code: "MubiLop/yeetyourfiles.js",
        banner: "MubiLop/yeetyourfiles.png",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        documentation: "YeetYourFiles",
        isGitHub: true,
    },
    {
        name: "File Upload",
        description: "Upload files to the Network, can also used with Files extension.",
        code: "Codefoxy/cfupload.js",
        banner: "Codefoxy/cfupload.svg",
        creator: "Codefoxy",
        isGitHub: false,
    },
    {
        name: "Video Sharing",
        description: "Share your screen or camera to your projects!",
        code: "pooiod/VideoSharing.js",
        banner: "pooiod/VideoSharing.svg",
        creator: "pooiod7",
        isGitHub: false,
    },
    {
        name: "WindowHasher",
        description: "Interact with URL hash: the part of the URL after a hashtag",
        code: "pooiod/WindowHasher.js",
        banner: "pooiod/WindowHasher.avif",
        creator: "pooiod7",
    },
    {
        name: "Scratchblocks",
        description: "Generate blocks in the Scratch3, or Scratch2 format.",
        code: "pooiod/Scratchblocks.js",
        banner: "pooiod/Scratchblocks.svg",
        creator: "pooiod7",
    },
    {
        name: "AuthPenguin",
        description: "Authenticate with anything and everything!",
        code: "MubiLop/authpenguin.js",
        banner: "MubiLop/authpenguin.avif",
        creator: "cicerorph",
        creatorAlias: "MubiLop",
        documentation: "AuthPenguin",
        isGitHub: true,
    },
    {
        name: "Google Auth",
        description: "Login with Google to your projects. Allows getting a name, profile picture and email from the google account.",
        code: "Ikelene/googleAuthExtension.js",
        banner: "Ikelene/ExtensionBanner.avif",
        creator: "ikelene",
        creatorAlias: "Ikelene",
        isGitHub: true,
    },
    {
        name: "Discord Auth",
        description: "Login with discord to your projects. Identify users by ID and username in a secure and easy way!",
        code: "NotHouse/DiscordAuth.js",
        banner: "NotHouse/DiscordAuth-banner.avif",
        creator: "enderhacker",
        isGitHub: true,
    },
    {
        name: "Twitch",
        description: "Communicate with your Twitch Chat on PenguinMod!\n\nPenguinMod is not affiliated with Twitch.",
        code: "bop_tw/Twitch.js",
        banner: "bop_tw/Twitch.avif",
        creator: "bop_tw",
        isGitHub: false,
    },
    {
        name: "Chess",
        description: "A powerful extension that lets you manage a chessboard, customize it, use Stockfish 17 (via API), a local chess engine (Lozza) and much, MUCH more!",
        code: "Gen1x/chess-ext.js",
        banner: "Gen1x/chess-ext.avif",
        creator: "G1nX",
        isGitHub: false,
    },
    {
        name: "CATS",
        description: "Blocks related to cats.",
        code: "Gen1x/CATS.js",
        banner: "Gen1x/cats.avif",
        creator: "G1nX",
    },
    {
        name: "Free Servers",
        description: "Here you can find a free server for your projects. And also check whether it is working now or not.\n\nЗдесь вы можете найти бесплатный сервер для своих проектов. А также проверить, работает он сейчас или нет.",
        code: "WAYLIVES/FreeServers.js",
        banner: "WAYLIVES/FreeServersIMG.svg",
        documentation: "FreeServers",
        creator: "WAYLIVES",
        isGitHub: false,
    },
    {
        name: "More Types",
        description: "Adds more value types to PenguinMod, implementing Functions, Objects, Arrays, Sets, Maps, Symbols and Nothing.",
        code: "VeryGoodScratcher42/More-Types.js",
        banner: "VeryGoodScratcher42/More-Types.avif",
        creator: "VeryGoodScratcher42",
        isGitHub: false,
    },
    {
        name: "oneko",
        description: "Cute cat that follows you on the block area.",
        code: "TheShovel/oneko.js",
        banner: "TheShovel/thumbnail-oneko.avif",
        creator: "TheShovel",
        isGitHub: true,
    },
    {
        name: "Counter++",
        description: "Count anything, at any time, in PenguinMod!",
        code: "MrRedstonia/counterplusplus.js",
        banner: "MrRedstonia/counterplusplus.avif",
        creator: "MrRedstonia",
        isGitHub: true,
    },
    {
        name: "How many lines?",
        description: "Blocks to determine the amount of new lines in a piece of text.",
        code: "Monochromasity/howmanylines.js",
        banner: "Monochromasity/placeholder-howmanylines.avif",
        creator: "Monochromasity",
        tags: ["small"],
        isGitHub: true,
    },
    {
        name: "Paint Utils",
        description: "A colour extension that lets you mix colours.",
        code: "Fruits555000/PaintUtils.js",
        banner: "Fruits555000/PaintUtils.svg",
        creator: "Fruits555000",
        isGitHub: true,
    },
    {
        name: "Resolution",
        description: "Provides utility blocks that simplify the creation of projects with dynamic resolution support.",
        code: "DogeisCut/Resolution.js",
        banner: "DogeisCut/Resolution.svg",
        creator: "DogeisCut",
        isGitHub: true, 
        documentation: "Resolution",
        notes: "Gallery banner by Dillon",
        tags: ["graphics", "utility"]
    },
    {
        name: "Device Motion",
        description: "Use Device Motion API to get rotation or movement of the device. Works best on mobile devices. \n Thumbnail by Dillon. ",
        code: "gaimerI17/DeviceMotion.js",
        banner: "gaimerI17/DeviceMotion.avif",
        creator: "gaimerI",
        isGitHub: true,
        creatorAlias: "gaimerI17",
        notes: "Extension thumbnail made by Dillon."
    },
    {
        name: "Cryptography",
        description: "Hash, encrypt and verify values using various algorithms. Actual security not guaranteed",
        code: "gaimerI17/crypto.js",
        banner: "gaimerI17/crypto.avif",
        creator: "gaimerI",
        isGitHub: true,
        creatorAlias: "gaimerI17",
    },
    /* these extensions are completely dead as of now
    {
        name: "Online Captcha",
        description: "Protect your project with simple, easy to use captcha implementation. Fully client-side, bypass-proof captcha solution!",
        code: "NotHouse/OnlineCaptcha.js",
        banner: "NotHouse/OnlineCaptcha-banner.avif",
        creator: "enderhacker",
        isGitHub: true,
    },
    {
        name: "Better Storage",
        description: "Like PenguinMod's Storage Extension, but with a couple more features, and faster servers.",
        code: "Gen1x/better_storage.js",
        banner: "Gen1x/betterstorage.avif",
        creator: "G1nX",
    },
    {
        name: "Mouth Washer",
        description: "Includes many utilities related to cleaning bad words, swearing and profanity. Thought of as an extra layer of security for filtering messages.\n\n(ft. violet and jwklong)",
        code: "Gen1x/mouth_washer.js",
        banner: "Gen1x/mw-placeholder.avif",
        creator: "G1nX",
    },
    */
        {
        name: "Smoke Detector",
        description: "Plays a beep every 30 seconds.",
        code: "electricfuzzball_pm/firealarm.js",
        banner: "electricfuzzball_pm/firealarm.svg",
        creator: "FloppyDisk-OSC",
        isGitHub: true,
        creatorAlias: "ElectricFuzzball_PM"
    },
        {
        name: "Stage Brah",
        description: "Spawn Brah cats in your codespace!",
        code: "electricfuzzball_pm/StageBrah.js",
        banner: "electricfuzzball_pm/StageBrah.svg",
        creator: "FloppyDisk-OSC",
        isGitHub: true,
        creatorAlias: "ElectricFuzzball_PM"
    },
        {
        name: "MIDI Controller",
        description: "Use a MIDI keyboard to interact with projects!",
        code: "electricfuzzball_pm/MIDI.js",
        banner: "electricfuzzball_pm/MIDI.svg",
        creator: "FloppyDisk-OSC",
        isGitHub: true,
        creatorAlias: "ElectricFuzzball_PM"
    },
        {
        name: "Array Buffers",
        description: "Read, parse, and write raw data efficiently using Array Buffers",
        code: "AndrewGaming587/agBuffer.js",
        banner: "AndrewGaming587/agBuffer.svg",
        creator: "AndrewScripter587",
        isGitHub: true,
        tags: ["customtype","data","utility","new","large"],
        creatorAlias: "AndrewGaming587"
    },
];

// Extensions that were taken from DinosaurMod
// (DinosaurMod's extensions were added here for IDs addition)
const dmExtensions = [
 {
        name: 'Site Runtime',
        extensionId: 'webextension.js',
        iconURL: 'site-runtime.png',
        description: 'A Combined version of multiple extensions: Packager Applications & AdaBrowser',
        featured: true,
        extDeveloper: 'MrIncredibleMaker',
        internetConnectionRequired: true,
        disabled: false
    },
    {
        name: 'Keys+',
        extensionId: 'keys-plus-extension.js',
        description: 'Detect more keys when they are pressed or hit and make certain keys typable.',
        extDeveloper: 'MrIncredibleMaker',
        inspiredExt: 'Typable Tab Character Extension and More Keys Events (by julmik6478) Extension',
        featured: true
    },
    {
        name: 'GitHub API',
        extensionId: 'github-api.js',
        iconURL: 'githubapi.png',
        description: 'Fetch IDs, Description, etc. from Repositories, Users and Organizations.',
        internetConnectionRequired: true,
        extDeveloper: 'MrIncredibleMaker',
        featured: true
    },
    {
        name: 'Python',
        extensionId: 'python.js',
        description: 'Run your own custom code written in Python using Pyodide!',
        credits: ['Pyodide'],
        extDeveloper: 'MrIncredibleMaker',
        internetConnectionRequired: true,
        featured: true
    },
    {
        name: 'Lua',
        extensionId: 'lua.js',
        description: 'Run your own custom code written in Lua using Fengari!',
        credits: ['Fengari'],
        extDeveloper: 'MrIncredibleMaker',
        internetConnectionRequired: true,
        featured: true
    },
    {
        name: 'Typable Tab Key',
        extensionId: 'typable-tab-character.js',
        description: 'This Extension was replaced by the Keys+ Extension. Gives the ability of typing the tab character.',
        extDeveloper: 'MrIncredibleMaker',
        featured: true
    },
    {
        name: 'Useless blocks',
        extensionId: 'Useless_Blocks.js',
        iconURL: 'Useless_Blocks.png',
        description: '',
        extDevHREF: {
            name: "Jambs / jlgri",
            href: "https://www.youtube.com/channel/UCJzRC3HsauioZoc9vKC6W4g"
        },
        featured: true
    },
    {
        name: 'Dogs',
        extensionId: 'dogs.js',
        description: 'Blocks related to dogs.',
        featured: true,
        inspiredExt: 'G1nX\'s Cats Extension',
        extDeveloper: 'MrIncredibleMaker'
    },
    {
        name: 'Functions and Tests',
        extensionId: 'jasmine.js',
        description: '',
        featured: true,
        disabled: true,
        inspiredExt: 'Jasmine (JS Framework)',
        extDeveloper: 'MrIncredibleMaker'
    },
];

// Extensions that were taken from ElectraMod
// (ElectraMod's extensions were added here for IDs addition)
const emExtensions = [
  {
        name: "Debugger Console",
        description: "Based on Turbowarp CN's Debugger by NOname",
        code: "Aness6040/debuggerconsole.js",
        banner: "Aness6040/debuggerconsole.svg",
        creator: "Aness6040",
        isGitHub: true,
    },
    {
        name: "Lazy Multi-lines",
        description: "A handy extension for JavaScript Extension or to create your own text file!",
        code: "Aness6040/lazymultilines.js",
        banner: "Aness6040/lazymultilines.svg",
        creator: "Aness6040",
        isGitHub: true,
    },
    {
        name: "Jul Mik Utilities",
        description: "An Extension of Blocks Utilities by Jul Mik (V1 and V2 when named Jul Mik Blocks with Turbobuilder) and helped by Aness6040 (Actual v3)",
        code: "julmik6478/julmik_utilities.js",
        banner: "julmik6478/julmik_utilities.svg",
        creator: "julmik6478",
        isGitHub: false,
    },
    /*
    {
        name: "GLSL Custom Shader",
        description: "GLSL Shaders on Scratch by PROMISE",
        code: "Aness6040/custom-shader.js",
        banner: "PROMISE/custom_shader.png",
    }, 
    */
    {
        name: "E2EE",
        description: "This is a Scratch 3 extension that enables E2EE (End-to-End Encryption). This E2EE extension utilizes the same underlying cryptography code that powers CloudLink Omega.",
        code: "MikeDev101/e2ee.js",
        banner: "MikeDev101/e2ee.svg",
        creator: "MikeDev101",
        isGitHub: true,
    },
    {
        name: "WebRTC",
        description: "A slimmed-down version of the CL5 protocol extension, designed to offer a basic implementation of the WebRTC standard for Scratch 3.",
        code: "MikeDev101/webrtc.js",
        banner: "MikeDev101/webrtc.png",
        creator: "MikeDev101",
        isGitHub: true,
    },
    {
        name: "ElectraAPI",
        description: "Based on Pang API for ElectraMod.",
        code: "Aness6040/electraapi.js",
        banner: "Aness6040/electraapi.svg",
        creator: "Aness6040",
        isGitHub: true,
    },
    {
        name: "ElectraGPT",
        description: "ElectraMod modification of PenguinGPT! Adds more prompts like Mishael or Slixbot!\nElectraGPT banner by Aness6040",
        code: "MubiLop/electragpt.js",
        banner: "MubiLop/electragpt.png",
        creator: "MubiLop",
        isGitHub: false,
    },
    {
        name: "Markdown to HTML",
        description: "Converts Markdown to HTML code.",
        code: "Aness6040/md2html.js",
        banner: "Aness6040/md2html.png",
        creator: "Aness6040",
        documentation: "md2html",
        isGitHub: false,
    },
];

// Extensions that were taken from Snail IDE.
// There were actually two sets of Snail IDE extensions. Set 2 uses snail-ide.js.org as a url.
// (Snail IDE's extensions were added here for IDs addition)
const snIDEExtensions = [
     {
        name: "Rounding+",
        description: "Expansion to the rounding blocks",
        code: "CharCoalAfterLife/rounding.js",
        banner: "CharCoalAfterLife/rounding.png",
        documentation: "rounding-plus",
        creator: "CharCoalAfterLife",
        isGitHub: true,
    },
];

const snIDETwoExtensions = [
     {
        name: "SnailShare API",
        description: "Fetch details of projects and users from Snailshare.",
        code: "api.js",
        banner: "snailideapiext.png",
        creator: "BA4X"
    },
     {
        name: "Prompts",
        description: "Good prompts for PenguinGPT.",
        code: "Prompts.js",
        banner: "Prompts.png",
        creator: "LoganCreatez"
    },
     {
        name: "Random Utils",
        description: "Random utilites that you may or may not use.",
        code: "random_utils.js",
        banner: "random.png"
    },
     {
        name: "Save Data",
        description: "Extremely easy way to save data.",
        code: "save.js",
        creator: "Mr_rudy"
    },
     {
        name: "Grayscale",
        description: "Toggle a dramatic grayscale effect on your project.",
        code: "grayscale.js",
		banner: "grayscale.svg",
        creator: "Mr_rudy"
    },
     {
        name: "Randomly Blocks",
        description: "Utilitys to have your project feel like a website",
        code: "randomlyBlocks.js",
        creator: "mariocraft987"
    },
];

// Extensions that were taken from Ark IDE
// (Ark IDE's extensions were added here for IDs addition)
const arkExtensions = [
        {
        name: "ArkIDE additions",
        description: "A simple extension that adds some cool new blocks for ArkIDE.",
        code: "Ark/arkide-additons.js",
        banner: "Ark/banner.png",
        creator: "Arc360",
        creatorAlias: "Ark",
        notes: ""
    },
    {
        name: "Json Number Array Operations",
        description: "A nice extension that adds useful operation blocks for Json Number Arrays.",
        code: "Ark/jsonnumberarray.js",
        banner: "Ark/jsonant.png",
        creator: "Arc360",
        creatorAlias: "Ark",
        notes: ""
    },
    {
        name: "ArkIDE Console",
        description: "Add a console to your project to log messages, errors, and warnings.",
        code: "Ark/arkide-console.js",
        banner: "Ark/console.png",
        creator: "Arc360",
        creatorAlias: "Ark",
        notes: ""
    },
    {
        name: "Timer Utils",
        description: "An extension that helps you count down to certain dates without having to do a bunch of math and coding.",
        code: "Ark/timerutils.js",
        banner: "Ark/timerutils.svg",
        creator: "Arc360",
        creatorAlias: "Ark",
        notes: ""
    },
    {
        name: "Store My Stuff",
        description: "Another varible storage extension but the server is running on the centeral ArkIDE server instead.",
        code: "Ark/store-my-stuff.js",
        banner: "Ark/storemystuff.png",
        creator: "Arc360",
        creatorAlias: "Ark",
        unstableReason: "Server uptime may not be perfect"
    },
    {
        name: "Comments",
        description: "Adds comment blocks to your project.",
        code: "Ark/comments.js",
        banner: "Ark/comments.png",
        creator: "Arc360",
        creatorAlias: "Ark",
    },
    {
        name: "Advanced Keyboard",
        description: "Upgraded keyboard input: key combos (2–5 keys), long press detection, WASD direction, key counters, HAT events with edge trigger, and last key tracking..",
        code: "Askyy/Advanced_keyboard.js",
        banner: "Askyy/keyboard.jpg",
        creator: "Askyy",
        creatorAlias: "Askyy",
    },
    {
        name: "Game Dev Utils",
        description: "Essential game dev blocks: FPS counter, delta time, frame count, rectangle collision, LERP, distance & angle calculations, camera follow, snap-to-grid, named timers, and screen wrap.",
        code: "Askyy/Devs_utilities_ex.js",
        banner: "Askyy/game_dev_utils.jpg",
        creator: "Askyy",
        creatorAlias: "Askyy",
    },
    {
        name: "Geography",
        description: "Country data for 195+ nations: capital, population, region, subregion, currency, timezone, flag URL, languages. Plus live geolocation and IP address lookup.",
        code: "Askyy/Geography_ex.js",
        banner: "Askyy/geography.jpg",
        creator: "Askyy",
        creatorAlias: "Askyy",
    },
    {
        name: "Internet & Device",
        description: "Read device info directly from the browser: connection status, browser name/version, screen size, CPU cores, memory, orientation, language, battery level and charging state.",
        code: "Askyy/Internet_Device_ex.js",
        banner: "Askyy/internet_and_device.jpg",
        creator: "Askyy",
        creatorAlias: "Askyy",
    },
    {
        name: "Weather",
        description: "Real-time weather for 300+ world cities via Open-Meteo: temperature, feels like, humidity, wind speed & direction, weather description, rain/snow detection, and tomorrow's forecast.",
        code: "Askyy/Weather_ex.js",
        banner: "Askyy/weather.png",
        creator: "Askyy",
        creatorAlias: "Askyy",
    },
];


// Extensions that were taken from GaiaMod (which is my other Scratch Mod lol)
// (GaiaMod's extensions were added here for IDs addition)
const gmExtensions = [
    {
        name: "Gaia Utilities",
        description: "Wonderful utility blocks!",
        code: "GaiaWindWave90/GaiaBlocks.js",
        banner: "GaiaWindWave90/GaiaUtilities.png",
        creator: "GaiaWindWave90 and other users",
        isGitHub: true,        
    },
    {
        name: 'GaiaGPT',
        description: 'A GaiaMod modification of Pang AI with more prompts.',
        code: "GaiaWindWave90/GaiaGPT.js",
        banner: "GaiaWindWave90/GaiaGPT.png",
        creator: "logise1123",
        isGitHub: true,
    },
    {
        name: 'Prompts',
        description: 'Prompts made for Gaia AI. Inspired by the prompts extension found in Snail-IDE.',
        code: "GaiaWindWave90/GTPPrompts.js",
        banner: "GaiaWindWave90/prompts.png",
        creator: "GaiaWindWave90",
        isGitHub: true,
    },
    {
        name: 'Spinach Facts',
        description: 'An extension about spinach! Based on Gen1x\'s CATS, MrIncredibleMaker\'s DOGS and pooiod7\'s Raccoon Facts extensions.',
        code: "GaiaWindWave90/SpinachFacts.js",
        banner: "GaiaWindWave90/spinach.png",
        creator: "GaiaWindWave90",
        isGitHub: true,
    },
    {
        name: "Penguin Attack!",
        description: "Edited version of the Fire in the Hole extension.",
        code: "GaiaWindWave90/PenguinAttack.js",
        banner: "GaiaWindWave90/PenguinAttack.png",
        creator: "GaiaWindWave90",
        isGitHub: true,        
    },
    {
        name: "Cocrea Fetch",
        description: "Fetches API from Cocrea or Gandi IDE.",
        code: "GaiaWindWave90/cocreaFetch.js",
        banner: "GaiaWindWave90/cocreaFetch.png",
        creator: "fath11",
        isGitHub: true,        
    },
    {
        name: "Webcam Recorder",
        description: "Records videos straight out of webcam.",
        code: "GaiaWindWave90/Webcamrecorder.js",
        banner: "GaiaWindWave90/WebCamThumb.png",
        creator: "-SIPC-",
        isGitHub: true,        
    },
];

export {
	extensions,
	dbExtensions,
	pmExtensions,
	dmExtensions,
	emExtensions,
	snIDEExtensions,
	snIDETwoExtensions,
	arkExtensions,
	gmExtensions
	}