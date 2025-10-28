## Example of the AI stream data with thinking

Diagram
Generating diagram...
Step 3/3
Explanation:
<think> Let me analyze the file tree and README to understand this project structure: 1. **Project Type and Purpose**: This is a desktop markdown editor called "milkup" - it's a modern, cross-platform desktop application for markdown editing. 2. **File Structure Analysis**: - It uses a desktop app structure with Electron-like architecture (main, renderer separation) - Frontend: Vue.js-based renderer process (src/renderer) - Backend: Main process handling (src/main) - Preload script for IPC bridge (src/preload.ts) - Build tool: Vite (vite.config.mts) - UI Components: Custom UI components and existing frameworks - Themes: Multiple theme support (crepe, frame, nord, etc.) - Plugins: Custom plugins system including mermaid, image handling - Internationalization: Language support (lang/) - Configuration and utilities 3. **Technology Stack**: - Frontend: Vue.js 3 - Editor: Milkdown (WYSIWYG markdown editor) and Vditor - Build: Vite + TypeScript - Desktop: Electron (implied by main/renderer structure) - UI: Custom components + CSS/LESS - Themes: CSS-based theming system 4. **Key Architectural Components**: - **Main Process**: File operations, menus, IPC bridge - **Renderer Process**: UI, editor, themes, plugins - **Shared Code**: Types, utilities, channels for IPC - **Plugin System**: Extensible architecture - **Theme System**: CSS-based theming with editor support - **File Management**: Local file operations - **Editor Engines**: Milkdown (WYSIWYG) + Vditor (alternative) Now I need to provide detailed instructions for creating a system design diagram tailored to this desktop markdown editor application. </think> <explanation> Based on the file tree and README analysis, this is a **desktop markdown editor application** called "milkup" built with Electron-like architecture. Here's how to create the most accurate system design diagram: ## Project Architecture Analysis **Project Type**: Desktop Application (Electron-based) with Vue.js frontend and custom markdown editing capabilities **Core Purpose**: Modern markdown editor with WYSIWYG editing, theme customization, and cross-platform desktop support ## Main System Components to Include in Diagram: ### 1. **Desktop Application Layer** - **Main Process** (src/main/) - File system operations - Menu management (menu.ts) - IPC Bridge (ipcBridge.ts) for main-renderer communication - Update management (update.ts) ### 2. **Frontend UI Layer** - **Renderer Process** (src/renderer/) - **Vue.js Application** (App.vue) - **Component System** (components/) - Core UI: MenuBar, TabBar, StatusBar, TitleBar - Editor Components: MilkdownEditor, VditorEditor, MarkdownSourceEditor - Settings: AppearancePage, FontPage, ThemePage - Utility: Tree, ColorPicker, Input, Selector components ### 3. **Editor Engine Layer** - **Milkdown Integration** (WYSIWYG markdown editor) - Theme support via public/milkdown-themes/ - Plugin system (plugins/) - **Vditor Editor** (Alternative editor option) - **Custom Plugins**: - Mermaid diagram rendering - Image path management - HTML/Markdown hybrid support ### 4. **Theme System** - **Theme Manager** (themeManager.ts) - **Multiple Themes**: crepe, frame, nord, normal variants - **Theme Editor** (ThemeEditor.vue) - **CSS-based Styling** (themes/ directory) ### 5. **File Management System** - **Local File Operations** (main process) - **Tab Management** (useTab.ts) - **File Tree Navigation** (Tree.vue, TreeNode.vue) - **Save/Load Functionality** ### 6. **Configuration & Settings** - **Theme Configuration** (src/config/theme.ts) - **Font Management** (src/config/fonts.ts) - **App Settings** (appearance, language, spell-check) ### 7. **Internationalization** - **Language Support** (lang/ directory) - **Localization System** ### 8. **Plugin/Extension System** - **Plugin Architecture** (plugins/) - **Custom Hooks** (hooks/ directory) - **Extensibility Points** ## Relationships & Data Flow: 1. **Main ↔ Renderer Communication**: IPC bridge for file operations, updates, settings 2. **Editor ↔ Theme System**: Dynamic theme switching affecting editor appearance 3. **File System ↔ Editor**: Direct file loading/saving through main process 4. **Plugin System ↔ Editor**: Extensible functionality integration 5. **Settings ↔ All Components**: Centralized configuration management ## Technology Stack to Highlight: - **Desktop**: Electron-like architecture - **Frontend**: Vue.js 3 Composition API - **Editors**: Milkdown (primary) + Vditor (alternative) - **Build**: Vite + TypeScript - **Styling**: LESS/CSS with custom theme system - **UI Components**: Custom component library ## Diagram Guidelines: **Use These Visual Elements:** - **Rectangles**: Main process, Renderer process, Editor engines - **Circles/Ovals**: UI components and plugins - **Diamond Shapes**: Configuration/settings systems - **Color Coding**: - Blue: Main process components - Green: Renderer/UI components - Purple: Editor systems - Orange: Configuration/theme systems - Gray: Shared/utility components **Arrow Styles:** - **Solid arrows**: Direct function calls/data flow - **Dashed arrows**: IPC communication (main ↔ renderer) - **Bi-directional arrows**: Plugin/theme interactions **Key Details to Capture:** - Show the separation between main process (file ops, menus) and renderer process (UI, editing) - Highlight the dual editor system (Milkdown + Vditor) - Emphasize the theme system as a core architectural feature - Include plugin extensibility points - Show internationalization support - Represent cross-platform desktop deployment This desktop markdown editor has a sophisticated architecture combining modern web technologies with desktop application patterns, emphasizing user experience through WYSIWYG editing, customizable themes, and extensibility.</explanation>
Mapping:
<think>
I need to analyze the system design explanation and map it to the file tree structure. Let me go through the components mentioned in the explanation and match them to the appropriate files and directories.

From the explanation, I can identify these main components:

1. **Main Process** (Desktop application layer)
2. **Renderer Process** (Frontend UI layer)
3. **Editor Engine Layer** 
4. **Theme System**
5. **File Management System**
6. **Configuration & Settings**
7. **Internationalization**
8. **Plugin/Extension System**

Let me map these to the actual file structure:

1. **Main Process**: src/main/ directory with files like index.ts, menu.ts, ipcBridge.ts 

2. **Renderer Process**: src/renderer/ directory with App.vue, components, etc.

3. **Editor Engine Layer**: Components like MilkdownEditor.vue, VditorEditor.vue, and the milkdown themes in src/renderer/public/milkdown-themes/ 

4. **Theme System**: src/themes/ directory, src/utils/themeManager.ts, ThemeEditor.vue, theme configs

5. **File Management System**: Files in main process and hooks like useFile.ts, useTab.ts, components like TabBar.vue 

6. **Configuration & Settings**: src/config/ directory, components like AppearancePage.vue, FontPage.vue 

7. **Internationalization**: lang/ directory

8. **Plugin/Extension System**: src/plugins/ directory with various plugins

Let me be more specific with the mappings:
</think>

Based on the system design explanation and file tree analysis, here's the component mapping for this desktop markdown editor:

<component_mapping>
1. **Main Process**: src/main/
   - Main entry point: src/main/index.ts
   - Menu management: src/main/menu.ts
   - IPC Bridge: src/main/ipcBridge.ts
   - Types definition: src/main/types.ts

2. **Renderer Process**: src/renderer/
   - Main app component: src/renderer/App.vue
   - Main entry: src/renderer/main.ts
   - HTML template: src/renderer/index.html

3. **Editor Engine Layer**: 
   - Milkdown Editor: src/renderer/components/MilkdownEditor.vue
   - Vditor Editor: src/renderer/components/VditorEditor.vue
   - Markdown Source Editor: src/renderer/components/MarkdownSourceEditor.vue
   - Milkdown themes: src/renderer/public/milkdown-themes/

4. **Theme System**: 
   - Theme Manager: src/utils/themeManager.ts
   - Theme Editor: src/renderer/components/ThemeEditor.vue
   - Theme configurations: src/themes/
   - Theme config: src/config/theme.ts
   - Nord theme: src/themes/nord/
   - Frame theme: src/themes/frame/
   - Crepe theme: src/themes/crepe/
   - Normal theme: src/themes/normal/

5. **File Management System**: 
   - Tab management: src/hooks/useTab.ts
   - File operations: src/hooks/useFile.ts
   - Tab bar component: src/renderer/components/TabBar.vue
   - Tree navigation: src/renderer/components/TreeNode.vue
   - WorkSpace: src/renderer/components/WorkSpace.vue

6. **Configuration & Settings**: 
   - Font configuration: src/config/fonts.ts
   - Theme configuration: src/config/theme.ts
   - Appearance settings: src/renderer/components/AppearancePage.vue
   - Font settings: src/renderer/components/FontPage.vue
   - Theme settings: src/renderer/components/ThemePage.vue

7. **UI Component Library**: 
   - Color Picker: src/renderer/components/ui/color-picker/ColorPicker.vue
   - Input component: src/renderer/components/ui/input/Input.vue
   - Selector: src/renderer/components/ui/selector/Selector.vue
   - Tree component: src/renderer/components/ui/tree/Tree.vue
   - Virtual Select: src/renderer/components/ui/virtual-select/VirtualSelect.vue

8. **Plugin System**: 
   - Plugin directory: src/plugins/
   - Mermaid plugin: src/plugins/mermaidPlugin/
   - Image Path plugin: src/plugins/imagePathPlugin.ts
   - Hybrid HTML plugin: src/plugins/hybridHtmlPlugin/
   - Custom paste plugin: src/plugins/customPastePlugin.ts

9. **Internationalization**: 
   - Language directory: lang/
   - Language index: lang/index.js
   - Language definitions: lang/index.json

10. **Hooks and State Management**: 
    - Context hook: src/hooks/useContext.ts
    - Content management: src/hooks/useContent.ts
    - Outline management: src/hooks/useOutline.ts
    - Save confirm: src/hooks/useSaveConfirmDialog.ts
    - Spell check: src/hooks/useSpellCheck.ts
    - Theme hook: src/hooks/useTheme.ts
    - Title management: src/hooks/useTitle.ts
    - Update dialog: src/hooks/useUpdateDialog.ts
    - WorkSpace: src/hooks/useWorkSpace.ts

11. **Shared Types and Channels**: 
    - IPC Channels: src/shared/channels/index.ts
    - Font types: src/shared/types/font.ts
    - Tab types: src/shared/types/tab.ts
    - Theme types: src/shared/types/theme.ts
    - Platform utilities: src/shared/utils/platform.ts

12. **Styling and Assets**: 
    - Global styles: src/renderer/style.less
    - Editor styles: src/renderer/styles/
    - Asset icons: src/assets/icons/
    - Icon fonts: src/assets/iconfont/

13. **Build Configuration**: 
    - Vite config: vite.config.mts
    - TypeScript config: tsconfig.json
    - ESLint config: eslint.config.mjs

14. **Core UI Components**: 
    - Menu bar: src/renderer/components/MenuBar.vue
    - Status bar: src/renderer/components/StatusBar.vue
    - Title bar: src/renderer/components/TitleBar.vue
    - Outline view: src/renderer/components/Outline.vue
</component_mapping>
Mermaid.js diagram:
Syntax error in textmermaid version 11.12.0
Diagram source code
<think>
Let me analyze the explanation and component mapping to create an accurate Mermaid.js system design diagram for this desktop markdown editor called "milkup".

From the explanation, I can see this is a sophisticated desktop application with:
1. Electron-like architecture (main/renderer processes)
2. Vue.js frontend with WYSIWYG markdown editing
3. Multiple editor engines (Milkdown + Vditor)
4. Theme system
5. Plugin architecture
6. File management
7. Internationalization
8. Configuration system

The component mapping provides specific file paths for each component, which I need to convert to click events for the Mermaid diagram.

Key architectural components I need to represent:
1. **Main Process Layer** - Electron main process handling
2. **Renderer Process Layer** - Vue.js UI layer
3. **Editor Engine Layer** - Milkdown/Vditor editors
4. **Theme System** - Theme management and CSS
5. **File Management** - Tab, file, workspace management
6. **Configuration** - Settings, themes, fonts
7. **UI Components** - Custom component library
8. **Plugin System** - Extensible plugin architecture
9. **Internationalization** - Language support
10. **Shared Communication** - IPC channels and types

I need to create a vertical diagram (as requested) that shows:
- Clear separation between main and renderer processes
- Data flow between components
- Plugin/theme extensibility
- File management workflows

Let me structure this as a flowchart with proper groupings:

1. Main Process (left side)
2. IPC Communication 
3. Renderer Process (center)
4. Editor System (right side)
5. Supporting systems (bottom)

I need to make sure to:
- Use proper Mermaid syntax
- Include click events for the mapped files/directories
- Show clear relationships
- Use appropriate visual shapes
- Keep it vertical as requested
- Avoid horizontal sprawl
</think>

```mermaid
flowchart TD
    %% ================================
    %% MAIN PROCESS LAYER
    %% ================================
    subgraph "Main Process Layer"
        mainEntry["src/main/index.ts<br/>Main Entry Point"]:::main
        menuManager["src/main/menu.ts<br/>Menu Management"]:::main
        ipcBridge["src/main/ipcBridge.ts<br/>IPC Communication Bridge"]:::main
        updateManager["src/main/update.ts<br/>Update Management"]:::main
        mainTypes["src/main/types.ts<br/>Main Process Types"]:::shared
        
        mainEntry --> menuManager
        mainEntry --> ipcBridge
        mainEntry --> updateManager
    end

    %% ================================
    %% SHARED COMMUNICATION LAYER
    %% ================================
    subgraph "Shared Communication"
        ipcChannels["src/shared/channels/index.ts<br/>IPC Channel Definitions"]:::shared
        sharedTypes["src/shared/types/<br/>Shared Type Definitions"]:::shared
        platformUtils["src/shared/utils/platform.ts<br/>Platform Utilities"]:::shared
        
        ipcBridge <--> ipcChannels
        ipcChannels --> sharedTypes
        platformUtils <--> ipcChannels
    end

    %% ================================
    %% IPC COMMUNICATION
    %% ================================
    ipcBridge <==|"IPC Bridge<br/>Main ↔ Renderer"| rendererMain["src/renderer/main.ts<br/>Renderer Entry Point"]

    %% ================================
    %% RENDERER PROCESS LAYER
    %% ================================
    subgraph "Renderer Process Layer"
        appComponent["src/renderer/App.vue<br/>Main Vue Application"]:::frontend
        htmlTemplate["src/renderer/index.html<br/>HTML Template"]:::frontend
        
        appComponent --> htmlTemplate
        rendererMain --> appComponent
    end

    %% ================================
    %% CORE UI COMPONENTS
    %% ================================
    subgraph "Core UI Components"
        menuBar["src/renderer/components/MenuBar.vue<br/>Menu Bar"]:::ui
        titleBar["src/renderer/components/TitleBar.vue<br/>Title Bar"]:::ui
        tabBar["src/renderer/components/TabBar.vue<br/>Tab Management"]:::ui
        statusBar["src/renderer/components/StatusBar.vue<br/>Status Bar"]:::ui
        workSpace["src/renderer/components/WorkSpace.vue<br/>Workspace Layout"]:::ui
        outline["src/renderer/components/Outline.vue<br/>Document Outline"]:::ui
        
        appComponent --> menuBar
        appComponent --> titleBar
        appComponent --> tabBar
        appComponent --> statusBar
        workSpace --> outline
    end

    %% ================================
    %% EDITOR ENGINE LAYER
    %% ================================
    subgraph "Editor Engine System"
        milkdownEditor["src/renderer/components/MilkdownEditor.vue<br/>Milkdown WYSIWYG Editor"]:::editor
        vditorEditor["src/renderer/components/VditorEditor.vue<br/>Vditor Alternative Editor"]:::editor
        markdownSourceEditor["src/renderer/components/MarkdownSourceEditor.vue<br/>Source Code Editor"]:::editor
        
        milkdownThemes["src/renderer/public/milkdown-themes/<br/>Editor Themes"]:::theme
        
        milkdownEditor <--> milkdownThemes
    end

    %% ================================
    %% FILE MANAGEMENT SYSTEM
    %% ================================
    subgraph "File Management System"
        tabHook["src/hooks/useTab.ts<br/>Tab State Management"]:::state
        fileHook["src/hooks/useFile.ts<br/>File Operations"]:::state
        contentHook["src/hooks/useContent.ts<br/>Content Management"]:::state
        workspaceHook["src/hooks/useWorkSpace.ts<br/>Workspace State"]:::state
        
        treeNode["src/renderer/components/TreeNode.vue<br/>File Tree Node"]:::ui
        treeComponent["src/renderer/components/ui/tree/Tree.vue<br/>File Tree Component"]:::ui
        
        tabBar --> tabHook
        tabHook --> fileHook
        fileHook --> contentHook
        treeComponent --> treeNode
        workSpace --> treeComponent
    end

    %% ================================
    %% THEME SYSTEM
    %% ================================
    subgraph "Theme System"
        themeManager["src/utils/themeManager.ts<br/>Theme Management Engine"]:::theme
        themeEditor["src/renderer/components/ThemeEditor.vue<br/>Theme Editor UI"]:::theme
        themeConfig["src/config/theme.ts<br/>Theme Configuration"]:::theme
        
        nordTheme["src/themes/nord/<br/>Nord Theme Package"]:::theme
        frameTheme["src/themes/frame/<br/>Frame Theme Package"]:::theme
        crepeTheme["src/themes/crepe/<br/>Crepe Theme Package"]:::theme
        normalTheme["src/themes/normal/<br/>Normal Theme Package"]:::theme
        
        themeEditor --> themeManager
        themeConfig --> themeManager
        themeManager --> nordTheme
        themeManager --> frameTheme
        themeManager --> crepeTheme
        themeManager --> normalTheme
        
        %% Theme-to-Editor relationships
        themeManager ==>|"Theme Data"| milkdownEditor
        themeManager ==>|"Theme Data"| vditorEditor
    end

    %% ================================
    %% PLUGIN SYSTEM
    %% ================================
    subgraph "Plugin Architecture"
        pluginDirectory["src/plugins/<br/>Plugin Directory"]:::plugin
        mermaidPlugin["src/plugins/mermaidPlugin/<br/>Mermaid Diagram Plugin"]:::plugin
        imagePathPlugin["src/plugins/imagePathPlugin.ts<br/>Image Path Management"]:::plugin
        hybridHtmlPlugin["src/plugins/hybridHtmlPlugin.ts<br/>HTML/Markdown Hybrid"]:::plugin
        customPastePlugin["src/plugins/customPastePlugin.ts<br/>Custom Paste Handling"]:::plugin
        
        pluginDirectory --> mermaidPlugin
        pluginDirectory --> imagePathPlugin
        pluginDirectory --> hybridHtmlPlugin
        pluginDirectory --> customPastePlugin
        
        %% Plugin-to-Editor relationships
        mermaidPlugin ==>|Diagram Support| milkdownEditor
        imagePathPlugin ==>|Image Handling| milkdownEditor
        hybridHtmlPlugin ==>|HTML Support| milkdownEditor
        customPastePlugin ==>|Paste Processing| milkdownEditor
    end

    %% ================================
    %% UI COMPONENT LIBRARY
    %% ================================
    subgraph "UI Component Library"
        colorPicker["src/renderer/components/ui/color-picker/ColorPicker.vue<br/>Color Selection"]:::ui
        inputComponent["src/renderer/components/ui/input/Input.vue<br/>Input Controls"]:::ui
        selectorComponent["src/renderer/components/ui/selector/Selector.vue<br/>Selection Controls"]:::ui
        virtualSelect["src/renderer/components/ui/virtual-select/VirtualSelect.vue<br/>Virtual Selection"]:::ui
    end

    %% ================================
    %% CONFIGURATION SYSTEM
    %% ================================
    subgraph "Configuration & Settings"
        fontConfig["src/config/fonts.ts<br/>Font Configuration"]:::config
        appearancePage["src/renderer/components/AppearancePage.vue<br/>Appearance Settings"]:::config
        fontPage["src/renderer/components/FontPage.vue<br/>Font Settings"]:::config
        themePage["src/renderer/components/ThemePage.vue<br/>Theme Settings"]:::config
        
        fontPage --> fontConfig
        appearancePage --> fontConfig
        themePage --> themeConfig
    end

    %% ================================
    %% INTERNATIONALIZATION
    %% ================================
    subgraph "Internationalization"
        languageDir["lang/<br/>Language Support Directory"]:::i18n
        languageIndex["lang/index.js<br/>Language Management"]:::i18n
        languageDef["lang/index.json<br/>Language Definitions"]:::i18n
        
        languageDir --> languageIndex
        languageIndex --> languageDef
    end

    %% ================================
    %% HOOKS AND STATE MANAGEMENT
    %% ================================
    subgraph "State Management & Hooks"
        contextHook["src/hooks/useContext.ts<br/>Context Management"]:::state
        outlineHook["src/hooks/useOutline.ts<br/>Outline State"]:::state
        spellCheckHook["src/hooks/useSpellCheck.ts<br/>Spell Check State"]:::state
        themeHook["src/hooks/useTheme.ts<br/>Theme State Management"]:::state
        titleHook["src/hooks/useTitle.ts<br/>Title Management"]:::state
        updateDialogHook["src/hooks/useUpdateDialog.ts<br/>Update Dialog State"]:::state
        saveConfirmHook["src/hooks/useSaveConfirmDialog.ts<br/>Save Confirm State"]:::state
        
        themeHook --> themeManager
        outlineHook --> outline
        spellCheckHook --> milkdownEditor
        titleHook --> titleBar
        updateDialogHook --> updateManager
    end

    %% ================================
    %% STYLING AND ASSETS
    %% ================================
    subgraph "Styling & Assets"
        globalStyles["src/renderer/style.less<br/>Global Styles"]:::style
        editorStyles["src/renderer/styles/<br/>Editor Stylesheets"]:::style
        assetIcons["src/assets/icons/<br/>Application Icons"]:::style
        iconFont["src/assets/iconfont/<br/>Icon Font Files"]:::style
        
        globalStyles --> editorStyles
        editorStyles --> milkdownEditor
        editorStyles --> vditorEditor
    end

    %% ================================
    %% DATA FLOW RELATIONSHIPS
    %% ================================
    %% File Management to Editors
    tabHook --> milkdownEditor
    tabHook --> vditorEditor
    tabHook --> markdownSourceEditor
    fileHook --> contentHook
    contentHook --> milkdownEditor
    contentHook --> vditorEditor
    contentHook --> markdownSourceEditor

    %% UI to State Management
    menuBar --> contextHook
    tabBar --> titleHook
    statusBar --> saveConfirmHook

    %% Configuration to UI
    fontConfig --> appearancePage
    themeConfig --> themeEditor

    %% Theme System Connections
    themeManager --> globalStyles
    themeManager --> editorStyles

    %% Click Events for Component Mapping
    click mainEntry "src/main/index.ts"
    click menuManager "src/main/menu.ts"
    click ipcBridge "src/main/ipcBridge.ts"
    click updateManager "src/main/update.ts"
    click mainTypes "src/main/types.ts"
    click appComponent "src/renderer/App.vue"
    click rendererMain "src/renderer/main.ts"
    click htmlTemplate "src/renderer/index.html"
    click milkdownEditor "src/renderer/components/MilkdownEditor.vue"
    click vditorEditor "src/renderer/components/VditorEditor.vue"
    click markdownSourceEditor "src/renderer/components/MarkdownSourceEditor.vue"
    click themeManager "src/utils/themeManager.ts"
    click themeEditor "src/renderer/components/ThemeEditor.vue"
    click themeConfig "src/config/theme.ts"
    click nordTheme "src/themes/nord/"
    click frameTheme "src/themes/frame/"
    click crepeTheme "src/themes/crepe/"
    click normalTheme "src/themes/normal/"
    click tabHook "src/hooks/useTab.ts"
    click fileHook "src/hooks/useFile.ts"
    click contentHook "src/hooks/useContent.ts"
    click workspaceHook "src/hooks/useWorkSpace.ts"
    click tabBar "src/renderer/components/TabBar.vue"
    click treeNode "src/renderer/components/TreeNode.vue"
    click treeComponent "src/renderer/components/ui/tree/Tree.vue"
    click workSpace "src/renderer/components/WorkSpace.vue"
    click menuBar "src/renderer/components/MenuBar.vue"
    click titleBar "src/renderer/components/TitleBar.vue"
    click statusBar "src/renderer/components/StatusBar.vue"
    click outline "src/renderer/components/Outline.vue"
    click pluginDirectory "src/plugins/"
    click mermaidPlugin "src/plugins/mermaidPlugin/"
    click imagePathPlugin "src/plugins/imagePathPlugin.ts"
    click hybridHtmlPlugin "src/plugins/hybridHtmlPlugin.ts"
    click customPastePlugin "src/plugins/customPastePlugin.ts"
    click colorPicker "src/renderer/components/ui/color-picker/ColorPicker.vue"
    click inputComponent "src/renderer/components/ui/input/Input.vue"
    click selectorComponent "src/renderer/components/ui/selector/Selector.vue"
    click virtualSelect "src/renderer/components/ui/virtual-select/VirtualSelect.vue"
    click fontConfig "src/config/fonts.ts"
```