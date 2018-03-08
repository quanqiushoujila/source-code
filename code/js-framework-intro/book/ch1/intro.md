# UI 框架与类库

这一章节中所涉及的框架，为支撑 UI 逻辑开发这一前端最常见业务开发需求的 UI 框架。这类框架会显著地影响前端的开发体验和效率，其设计思路在前端的发展过程中也有着相当大的演进。从 Backbone 将 MVC 的思想引入前端，到以 Angular / Vue 为代表的数据绑定 MV* 框架，再到完全支撑 View 的 React，这一类框架的演化历程中，有相当多便捷特性的实现，值得框架的使用者理解。

在开始深入细节前，有必要澄清框架 / 类库 / 工具 / 插件等几种常见的【轮子】在概念上的一些区别：

* **框架** - Framework - 深刻影响业务代码组织模式与业务逻辑实现方式的轮子，对具体业务逻辑的侵入性很强。所谓【基于某框架开发某业务项目】，一般情况下意味着该项目大量应用了框架封装的特性，较难迁移到另一种框架上。
* **类库** - Library - 提供 API 实现项目中某个特定功能的轮子，如实现【图表可视化】与【异步数据获取】等功能的轮子，其实际用途较框架而言更易于用【输入】-【输出】描述，对业务逻辑的侵入性相对较弱。
* **工具** - Tool - 不影响具体业务逻辑的编写，在开发环境中为开发者提供支持的轮子。典型的工具如 Linter 与各类模块加载工具，它们的配置和使用，对业务代码是透明的，对业务逻辑几乎没有侵入性。
* **插件** - Plugin - 用于定制框架 / 类库 / 工具的轮子，和上面三者的微妙区别在于【调用者的控制反转】。一般而言，不论框架、类库还是工具，都是由开发者的代码来调用，或由开发者的配置文件来配置的。然而，对插件而言，调用者则发生了反转。通常插件的使用方式，是将其提供给框架或类库调用，从而实现定制化的功能。这也就意味着插件不是【面向开发者的轮子】，而是【面向轮子的轮子】。

上述定义并非来源于作者凭空的想象，在各大 JavaScript 社区火热的项目对自身的简介中，即可一窥端倪：

* jQuery: [jQuery is a fast, small, and feature-rich JavaScript **library**](https://jquery.com/)
* AngularJS: [AngularJS — Superheroic JavaScript MVW **Framework**](https://angularjs.org/)
* React: [A JavaScript **library** for building user interfaces](https://facebook.github.io/react/)
* Vue.js: [The Progressive
JavaScript **Framework**](https://vuejs.org/)

可以发现，jQuery 与 React 对自己的定义是 Library，而 Vue 与 Angular 则认为自己是 Framework。实际上，这也是十分贴合它们的使用场景的：

jQuery 的核心是提供一个简洁的 `$` API 来封装与简化 DOM 操作，React 的核心在于提供一个【输入 props 属性，输出 DOM】的纯 View 层。它们并不假定使用者代码的组织形式，原本亦不具备很强的侵入性。例如，jQuery 不论在前后端是否分离的项目中均可使用，React 的模型层可以是 Backbone / Flux / Redux…而 Angular 与 Vue 在完整的使用形态下，则提供了一整套开发解决方案，具有较强的侵入性（当然，轻量的 Vue 可作为纯粹的 View 层使用，这里讨论的是引入全套方案时的情形）。因而，这两者对自身【框架】的定位也是很准确的。

将类库当做框架来使用，容易导致阻抗不匹配的问题。例如，早期的 jQuery 项目中常见大量的面条代码与 HTML 拼接，而纯 React 项目里更是多见一层层的 setState、模板与业务逻辑的杂糅，以及铺天盖地的 `bind`。这并不是 jQuery 或 React 本身的设计问题，而是使用者并没有定位好【类库】与【框架】之间的区别。在规模较大的项目中，框架所引入的 MVC / MVVM 等设计模式，能够帮助使用者更有效地组织代码，在项目 Scale Up 或需求频繁变更时保持良好的可维护性。

虽然本书名为介绍【框架】的设计入门，但实际上各类解决 UI 开发问题的类库与框架，在社区的讨论中并没有泾渭分明的界限。下文中在介绍 MVC 与 MVVM 这类【框架】层面的模式与原理时，同样有不少相关的核心特性与【类库】也是一衣带水的。因此，在这个主题与后续的各主题中，实际上对二者均有涉及，希望读者根据上下文注意区分。