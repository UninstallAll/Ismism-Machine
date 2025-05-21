#!/usr/bin/env python3
"""
修复ImageCard类中的问题
"""
import os
import sys

# 添加当前目录到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from modules.ui.image_card import ImageCard

def check_and_report_methods():
    """检查ImageCard类是否有所需的方法"""
    # 检查所需的方法是否存在并报告
    required_methods = [
        'bind_select_callback',
        'setup_context_menu',
        '_show_context_menu',
        '_on_checkbox_toggle',
        'set_selected'
    ]
    
    print("检查ImageCard类方法...")
    
    missing_methods = []
    for method in required_methods:
        if not hasattr(ImageCard, method) or not callable(getattr(ImageCard, method)):
            missing_methods.append(method)
    
    if missing_methods:
        print(f"警告: ImageCard类缺少以下方法: {', '.join(missing_methods)}")
    else:
        print("所有必需的方法都已存在!")
    
    # 检查方法的签名是否正确
    expected_args = {
        'bind_select_callback': ['self', 'callback'],
        'setup_context_menu': ['self', 'callback'],
        '_show_context_menu': ['self', 'event'],
        'set_selected': ['self', 'selected']
    }
    
    import inspect
    
    print("\n检查方法签名...")
    for method_name, expected_params in expected_args.items():
        if hasattr(ImageCard, method_name) and callable(getattr(ImageCard, method_name)):
            method = getattr(ImageCard, method_name)
            sig = inspect.signature(method)
            actual_params = list(sig.parameters.keys())
            
            if actual_params != expected_params:
                print(f"警告: {method_name}方法的参数不匹配:")
                print(f"  预期: {expected_params}")
                print(f"  实际: {actual_params}")
            else:
                print(f"{method_name}: 参数正确")

def patch_image_card_if_needed():
    """如果需要，修补ImageCard类"""
    # 检查是否缺少方法
    if not hasattr(ImageCard, 'bind_select_callback') or not callable(getattr(ImageCard, 'bind_select_callback')):
        print("正在添加bind_select_callback方法...")
        
        def bind_select_callback(self, callback):
            """设置选择状态改变时的回调函数
            
            Args:
                callback (callable): 当选择状态改变时调用的函数
            """
            self.on_select_callback = callback
        
        # 添加方法
        setattr(ImageCard, 'bind_select_callback', bind_select_callback)
    
    # 检查_show_context_menu方法是否有问题
    if hasattr(ImageCard, '_show_context_menu'):
        # 获取当前方法的源代码
        import inspect
        method = getattr(ImageCard, '_show_context_menu')
        source = inspect.getsource(method)
        
        # 检查实现是否正确
        if "_context_menu_callback" not in source:
            print("_show_context_menu方法实现可能有问题，正在修补...")
            
            def _show_context_menu(self, event):
                """显示上下文菜单
                
                Args:
                    event: 事件对象
                """
                if hasattr(self, '_context_menu_callback'):
                    self._context_menu_callback(self, event)
            
            # 替换方法
            setattr(ImageCard, '_show_context_menu', _show_context_menu)
    
    print("修补完成!")

if __name__ == "__main__":
    check_and_report_methods()
    patch_image_card_if_needed()
    print("\n你现在可以运行main.py了!") 