
var a='<P><IMG src="http://bbs.cn.yimg.com/user_img/200701/31/jisuanji986_117025184198149.jpg" mce_src="http://bbs.cn.yimg.com/user_img/200701/31/jisuanji986_117025184198149.jpg"></P>'
var b=/<IMG src=\"([^\"]*?)\">/gi
var s=a.match(b)
for(var i= 0;i<s.length;i++)
{
console.log(s[i]);
console.log(RegExp.$1)
}
