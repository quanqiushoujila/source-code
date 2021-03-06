# JavaScript 框架设计入门
各类 JavaScript 框架在现代的前端开发中非常常用，但许多前端开发者在使用框架时，实际上并不了解框架背后所封装的算法与设计模式，对框架的理解亦停留在【熟悉 API】的水平上。虽然这对于日常的业务开发并没有影响，然而对框架层面的技术储备的缺乏，或许会成为技术生涯中潜在的瓶颈。

另一方面，在开源社区中，从【对框架实现原理感兴趣】到【能够为框架开发贡献代码】之间，实际上存在着非常大的鸿沟。初学者在研读主流框架源码时，常常需要面对庞大而晦涩的源码库。由于常见的主流框架已经历了 Real World 的考验，其源码中多存在着各类影响阅读的 Workaround，故而要从中获得核心的【框架核心功能如何实现】信息，往往存在着较大的困难。

要实现【框架的使用者】到【框架的开发者 / 维护者】之间从 0 到 1 的转型，其中的一个关键门槛，在于【自己动手实现一个原型】。而帮助读者跨越这个门槛，则正是作者编写本书的目的。在后续的内容中，本书将**从介绍框架原理开始，通过几十行级的代码实现各框架的核心原理示例，来向感兴趣的读者展示这些核心原理的实现方式**，为从 0 到 1 的进阶提供一些参考与帮助。

当然，相信有些同学一定会有这样的疑问：各类框架都已经有了非常成熟的方案，为什么还要重复造轮子，或者学习和造轮子相关的知识呢？一方面，重复造轮子并不等于重新发明轮子，造轮子的过程本身就有利于个人的成长。另一方面，举一个不太恰当的例子，C919 大飞机的引擎是进口的，整机也有许多部分来自世界各地。采用这些现成的轮子成功地降低了整个项目的开发成本，是否就意味着中国不需要相关的技术储备了呢？现有框架在特定场景下不能满足需求（好比引擎为运输机设计，但需求却是战斗机）时，对框架原理的了解显然会对优化、定制甚至重构带来更大的帮助。

由于各类 JavaScript 框架所覆盖的范围极广，其中涉及的各类算法与模式更是百花齐放，因而作者仅能在自身的能力范围内，选取若干常见的框架为主题与读者分享。在本书初期写作阶段，涉及的框架主题包括：

* 用于日常前端 UI 开发的框架，如 MVC / MVVM 等模式的各类代表性框架。
* 用于填补 JavaScript / DOM API 缺陷的框架，如 jQuery / Lodash 等工具类型的框架（称之为类库可能更加合适）。

希望对这些框架的实现原理感兴趣，但尚未深入理解过框架原理的读者，在阅读本书后能够加深对这些框架的理解，从框架的实现中得到启发，最终能对前端社区发展有所贡献。

当然，由于作者水平有限，叙述和示例中难免存在各式各样的问题。非常欢迎更有经验的开发者能够以 Issue / PR 的方式提出讨论，或是参与更多框架主题 / 章节的编写，让本书能够帮助更多的前端开发者入门框架设计这一最终能够对开源社区有所贡献的领域。
