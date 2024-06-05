// 登录账号：邮箱/手机号码
export const ACCOUNT_REG = /^((\w-*\.*)+@(\w-?)+(\.\w{2,})+)|([1][3,4,5,7,8,9][0-9]{9})$/;
// 邮箱
export const EMAIL_REG = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
// 手机号码
export const TELEPHONE_REG = /^[1][3,4,5,7,8,9][0-9]{9}$/;
// 密码：8～20位，必须同时包含字母、数字及除去回车、空格、TAB的特殊符号
export const PASSWORD_REG = /^(?=.*\d)(?=.*[A-Za-z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])(?!.*\s)[\dA-Za-z!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{8,20}$/;
// 密码：
export const PWD_REG = /^[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+$/;
// 经度：取值范围0-180,保留0-6位小数
export const LONGITUDE_REG = /^[+-]?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,6})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
// 纬度：取值范围0-90,保留0-6位小数
export const LATITUDE_REG = /^[+-]?([0-8]?\d{1}\.\d{0,6}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
// 标识符：1～32位，字符：英文、"_-"、数字、允许中间有空格
export const IDENTIFIER_REG = /^[A-Za-z0-9_-](([A-Za-z0-9_-\s]{0,30}[A-Za-z0-9_-])|([A-Za-z0-9_-]{0,31}))$/;
// 通用：允许中间有空格
export const TRIM_512_REG = /^\S((.{0,510}\S)|(\S{0,511}))$/;
// 通用：允许中间有空格
export const TRIM_500_REG = /^\S((.{0,498}\S)|(\S{0,499}))$/;
// 通用：允许中间有空格
export const TRIM_50_REG = /^\S((.{0,48}\S)|(\S{0,49}))$/;
// 用户名：1～32位，字符：由1~32位英文字母、数字、@、点、下划线、中划线(除回车、TAB外)组成
export const USERNAME_REG = /^\S((.{0,30}\S)|(\S{0,31}))$/;
// 名称：1～32位，字符：由1~32位英文字母、数字、@、点、下划线、中划线(除回车、TAB外)组成
export const NAME_32_REG = /^\S((.{0,30}\S)|(\S{0,31}))$/;
// 名称：1～64位，字符：由1~64位英文字母、数字、@、点、下划线、中划线(除回车、TAB外)组成
export const NAME_64_REG = /^\S((.{0,62}\S)|(\S{0,63}))$/;
// 非负浮点数，小数点前最多6位，小数点后最多10位
export const POSITIVE_FLOAT_REG = /^\d{1,6}(\.[\d]{0,10})?$/;
// 浮点数，小数点前最多6位，小数点后最多10位
export const FLOAT_REG = /^-?\d{1,6}(\.[\d]{0,10})?$/;
// 正整数
export const POSITIVE_INT_REG = /^[1-9]*\d+$/;
// 工况名称：1~32位，字符：由1~32位英文字母、数字、@、点、下划线、中划线(除回车、TAB外)组成
export const CONDITION_NAME_REG = /^\S((.{0,30}\S)|(\S{0,31}))$/;
// 特殊字符
export const SPECIAL_REG = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
// 常规整数
export const INT_REG = /^-?\d+$/;
// 常规浮点数
export const NORMAL_FLOAT_REG = /^(-?\d+)(\.\d+)?$/;
// 有1~32位字符，英文、字母、特殊字符组成
export const TRIM_32_REG = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[~!@#$%^&*])[\da-zA-Z~!@#$%^&*]{1,32}$/;
// 中文校验
export const CHINAESE = /[\u4E00-\u9FA5]/g;
