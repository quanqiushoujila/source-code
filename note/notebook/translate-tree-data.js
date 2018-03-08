/**
 *  群里一个小伙伴提的问题，转换树形结构。
 *  趁着有时间就写了一个，以后再有类似的，可以直接拿这个function来用了。
 *  #造轮子#系列
 *  @date 2017-10-16
 *  @author jiasm
 */

var jsonData = [
  {"provname":"广东","cityname":"深圳","localname":"罗田","deptname":"保险1","struid":"C0092","manager":"小飞","telephone":"020-110"},
  {"provname":"广东","cityname":"深圳","localname":"福田","deptname":"保险2","struid":"C0092","manager":"小张","telephone":"020-110"},
  {"provname":"广东","cityname":"深圳","localname":"福田","deptname":"保险3","struid":"C0092","manager":"小名","telephone":"020-110"},
  {"provname":"广东","cityname":"东莞","localname":"厚街","deptname":"保险4","struid":"C0092","manager":"小飞","telephone":"020-110"},
  {"provname":"广东","cityname":"广州","localname":"白云","deptname":"保险5","struid":"C0092","manager":"小张","telephone":"020-110"},
  {"provname":"广东","cityname":"广州","localname":"荔湾","deptname":"保险6","struid":"C0092","manager":"小张","telephone":"020-110"},
  {"provname":"广东","cityname":"东莞","localname":"厚街","deptname":"保险7","struid":"C0092","manager":"小名","telephone":"020-110"},
  {"provname":"广东","cityname":"惠州","localname":"厚街","deptname":"保险7","struid":"C0092","manager":"小名","telephone":"020-110"},
  {"provname":"广东","cityname":"东莞","localname":"厚街","deptname":"保险7","struid":"C0092","manager":"小名","telephone":"020-110"},
  {"provname":"广东","cityname":"惠州","localname":"厚街","deptname":"保险7","struid":"C0092","manager":"小名","telephone":"020-110"},
  {"provname":"广东","cityname":"惠州","localname":"厚街","deptname":"保险7","struid":"C0092","manager":"小名","telephone":"020-110"}
]

/**
 * 转换一维数组为树形数组
 * @param  {Array} keys  树形结构的参照key
 * @param  {Array} data  待转换的原始数据
 * @return {Array}       转换后的数组
 * @api    private
 */
function translate (keys, data) {
  let [key, ...nextKeys] = keys
  let hasNextKey = nextKeys && nextKeys.length
  let map = {}

  data.forEach(item => {
    let k = item[key]
    if (k && !map[k]) {

      // 获取源数组中所有命中的`item`认为这些`item`为子项
      let childList = data.filter(item => item[key] === k).map(item => delete item[key] && item)
      map[k] = {
        [key]: k,
        list: hasNextKey ? translate(nextKeys, childList) : childList  // 如果还有用来分组的key，继续执行，否则返回数组
      }
    }
  })

  return Object.values(map)
}

let result = translate(['provname', 'cityname', 'localname'], jsonData)

console.log(result)
