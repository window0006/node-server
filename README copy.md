# SSG Server

静态站点生成服务器，基于 Koa + TypeScript 构建。

## 项目结构

```
src/
├── common/              # 公共模块
│   ├── utils/          # 工具函数
│   └── consts/         # 常量定义
├── repository/         # 数据访问层
│   ├── entity/        # 数据实体定义
│   └── dao/           # 数据访问对象
├── service/           # 业务逻辑层
├── controller/        # 控制器层
└── router/           # 路由层
```

## 开发规范

### 1. 文件命名规范

- 使用 kebab-case（连字符）命名方式
- 全部小写字母
- 单词间使用连字符（-）连接
- 例如：`user-service.ts`, `auth-middleware.ts`

### 2. 分层架构规范

#### 2.1 Router 层
- 位置：`src/router/`
- 职责：
  - 定义 API 路由
  - 组织路由分组
  - 注册中间件
- 命名规范：`[模块名].ts`
- 示例：
```typescript
import Router from 'koa-router';
const router = new Router({ prefix: '/api/[资源]' });

router
  .get('/:id', controller.get)
  .post('/', controller.create);
```

#### 2.2 Controller 层
- 位置：`src/controller/`
- 职责：
  - 处理 HTTP 请求
  - 参数验证
  - 调用 Service 层
  - 处理响应
- 命名规范：`[模块名].ts`
- 示例：
```typescript
export class UserController {
  async getUser(ctx: Context) {
    try {
      const user = await this.userService.getUser(ctx.params.id);
      ctx.body = ApiResponse.success(user);
    } catch (error) {
      ctx.body = ApiResponse.error(error.message);
    }
  }
}
```

#### 2.3 Service 层
- 位置：`src/service/`
- 职责：
  - 实现业务逻辑
  - 调用多个 DAO
  - 处理业务异常
  - 数据转换和验证
- 命名规范：`[模块名].ts`
- 示例：
```typescript
export class UserService {
  async createUser(data: UserDTO): Promise<User> {
    // 业务逻辑处理
    const existingUser = await this.userDao.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    return this.userDao.create(data);
  }
}
```

#### 2.4 Repository 层
- 位置：`src/repository/`
- 子目录：
  - `entity/`: 数据实体定义
  - `dao/`: 数据访问对象
- 职责：
  - 定义数据结构
  - 实现数据库操作
  - 处理数据映射
- 命名规范：
  - 实体：`[模块名].ts`
  - DAO：`[模块名].ts`
- 示例：
```typescript
// entity
export interface UserEntity {
  id: string;
  email: string;
  password: string;
}

// dao
export class UserDao {
  async findById(id: string): Promise<UserEntity | null> {
    // 数据库操作
  }
}
```

#### 2.5 Common 层
- 位置：`src/common/`
- 子目录：
  - `utils/`: 工具函数
  - `consts/`: 常量定义
- 职责：
  - 提供公共函数
  - 定义常量
  - 共享类型

### 3. 错误处理规范

#### 3.1 错误类型
```typescript
// 基础错误接口
interface BaseError extends Error {
  code?: string;          // 错误代码
  status?: number;        // HTTP 状态码
  details?: unknown;      // 错误详情
}

// 具体错误类型
- HttpError: HTTP 通信相关错误
- BusinessError: 业务逻辑错误
- ValidationError: 数据验证错误
- DatabaseError: 数据库操作错误
```

#### 3.2 错误处理原则

1. **中间件层面**
   - 使用统一的错误处理中间件
   - 根据环境区分错误详情的展示
   - 记录带有请求 ID 的错误日志

2. **Controller 层面**
   - 使用 try-catch 包装所有异步操作
   - 统一使用 ResponseUtil 处理响应
   - 不在 Controller 中处理具体业务逻辑

3. **Service 层面**
   - 抛出具体的业务错误
   - 使用自定义错误类型
   - 提供详细的错误信息

#### 3.3 业务返回码
```typescript
enum RetCode {
  SUCCESS = 0,
  
  // 通用错误码 (1-99)
  UNKNOWN_ERROR = 1,
  VALIDATION_ERROR = 2,
  
  // 认证相关错误码 (100-199)
  UNAUTHORIZED = 100,
  TOKEN_EXPIRED = 101,
  INVALID_TOKEN = 102,
  
  // 权限相关错误码 (200-299)
  PERMISSION_DENIED = 200,
  
  // 资源相关错误码 (300-399)
  RESOURCE_NOT_FOUND = 300,
  RESOURCE_ALREADY_EXISTS = 301,
  
  // 服务端错误码 (500-599)
  INTERNAL_SERVER_ERROR = 500,
  DATABASE_ERROR = 501,
  REMOTE_SERVICE_ERROR = 502
}
```

### 4. API 响应格式

#### 4.1 成功响应
```typescript
{
  retcode: RetCode;      // 业务返回码
  data?: T;             // 响应数据
  message?: string;     // 提示信息
}
```

#### 4.2 错误响应
```typescript
{
  retcode: RetCode;     // 业务返回码
  message: string;      // 错误信息
  details?: unknown;    // 错误详情（仅开发环境）
}
```

#### 4.3 使用示例
```typescript
// Controller 中的错误处理
try {
  const result = await service.doSomething();
  ctx.body = ResponseUtil.success(result);
} catch (error) {
  if (error instanceof BusinessError) {
    ctx.body = ResponseUtil.error(
      error.code,
      error.message,
      error.details
    );
  } else {
    ctx.body = ResponseUtil.error(
      RetCode.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
}
```

## 开发环境设置

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 生产构建
```bash
pnpm build
```

### 启动生产服务
```bash
pnpm start
```

## 环境配置

项目使用 `.env` 文件管理环境变量：

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

## 代码质量

- 使用 ESLint 进行代码检查
- 使用 TypeScript 进行类型检查
- 遵循 REST API 设计原则
- 保持代码简洁和可维护性 