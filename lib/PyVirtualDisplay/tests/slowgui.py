from easyprocess import EasyProcess
import time

def main():
    time.sleep(5)
    EasyProcess('zenity --question').start()
    
if __name__=="__main__":
    main()    